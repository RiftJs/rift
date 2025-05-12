import { Logger } from "../utils/logger";
import { LexerError } from "./lexer-error";
import { CommonTokenTypes, IdentifierToken, Token, TokenPosition, TokenType } from "./tokens";

export enum LexerState
{
    TextParsing = "TEXT_PARSER",
    OpenTagParsing = "OPEN_TAG_PARSER",
    CloseTagParsing = "CLOSE_TAG_PARSER",
    ScriptParsing = "SCRIPT_PARSER",
    StyleParsing = "STYLE_PARSER",

    // Not implemented yet
    Declaration = "DECLARATION_PARSER",
    ProcessingInstruction = "PROCESSING_INSTRUCTION_PARSER",
    Comment = "COMMENT_PARSER",
};

export class Lexer
{
    protected _input: string = "";
    protected index = 0;
    protected length = 0;
    protected line = 1;
    protected column = 1;
    protected currentState: LexerState = LexerState.TextParsing;

    protected _lastToken: Token | null = null;
    protected _currentToken: Token | null = null;
    protected tokenBuffer: Token[] = [];
    protected lexerMap: { [K in LexerState]?: () => Token | null } = {
        [LexerState.TextParsing]: () => this.parseText(),
        [LexerState.OpenTagParsing]: () => this.parseOpenTag(),
        [LexerState.CloseTagParsing]: () => this.parseCloseTag(),

        [LexerState.Declaration]: () => this.parseDeclaration(),
        // [LexerState.ProcessingInstruction]: () => this.parseProcessingInstruction(),
        [LexerState.Comment]: () => this.parseComment(),
    };

    constructor(
        input: string,

    )
    {
        this._input = input;
        this.length = input.length;
    }


    protected get isEOF(): boolean
    {
        return this.index >= this.length;
    }

    protected get canAdvance(): boolean
    {
        return this.index < this.length;
    }

    /* inline */
    protected current(): string
    {
        return this._input[this.index];
    }

    /* inline */
    protected next(): string | null
    {
        return this.peek(1);
    }

    /* inline */
    protected peek(offset: number): string | null
    {
        return this._input[this.index + offset] || null;
    }

    protected advance(offset: number = 1): void
    {
        while (offset-- > 0 && this.canAdvance)
        {
            // Handle \r\n as a single newline
            if (this.current() === "\r" && this.next() === "\n")
            {
                this.index += 2;
                this.line++;
                this.column = 1;
                continue;
            }

            if (this.current() === "\n" || this.current() === "\r")
            {
                this.index++;
                this.line++;
                this.column = 1;
            } else
            {
                this.index++;
                this.column++;
            }
        }
    }

    // Produces the next token and advances the stream
    public nextToken(): Token | null
    {
        if (this.tokenBuffer.length > 0)
        {
            return this.tokenBuffer.shift() || null;
        }

        return this._parseToken();
    }

    public lastToken(): Token | null
    {
        return this._lastToken;
    }

    public tokenize(): Token[]
    {
        let tokens: Token[] = [];
        while (this.canAdvance)
        {
            const token = this.nextToken();
            if (token === null)
            {
                break;
            }

            tokens.push(token);
        }

        return tokens;
    }

    public reset(): void
    {
        this.index = 0;
        this.line = 1;
        this.column = 1;
        this.currentState = LexerState.TextParsing;
        this.tokenBuffer = [];
        this._lastToken = null;
        this._currentToken = null;
    }

    // Peeks at the next token without advancing the stream
    public peekToken(offset: number = 0): Token | null
    {
        while (this.tokenBuffer.length <= offset)
        {
            const token = this._parseToken();
            if (token === null)
            {
                return null;
            }

            this.tokenBuffer.push(token);
        }

        return this.tokenBuffer[offset];
    }

    // Consumes a token we previously peeked. It throws an error if there is no token to consume
    public consumeToken(amount: number = 1): void
    {
        while (amount-- > 0)
        {
            if (this.tokenBuffer.length === 0)
            {
                throw this.error("No token to consume");
            }

            this.tokenBuffer.shift();
        }
    }


    // Parses a token from the stream given the current state or the given state
    protected _parseToken(state?: LexerState): Token | null
    {
        if (state === undefined)
        {
            state = this.currentState;
        }

        if (this.isEOF)
        {
            return null;
        }

        let lexer = this.lexerMap[state];
        if (lexer === undefined)
        {
            throw this.error(`Lexer state ${state} not implemented`);
        }

        this._lastToken = this._currentToken;
        let token = lexer();
        this._currentToken = token;

        Logger.verbose(`Parsed token: ${token?.kind}`, "Lexer");

        return token;
    }

    // Sets the current state of the lexer
    protected state(newState: LexerState): void
    {
        this.currentState = newState;
        Logger.log(`State changed to ${newState}`, "Lexer");
    }

    // Returns the current position in the stream
    public position(): TokenPosition
    {
        return {
            line: this.line,
            column: this.column,
            offset: this.index,
        };
    }

    // Creates a new LexerError with the current position
    // and the given message
    protected error(message: string): LexerError
    {
        return new LexerError(message, this.position());
    }

    // Parses text until a tag is found
    protected parseText(): Token | null
    {
        let text = "";


        while (this.canAdvance)
        {
            if (this.current() === "<")
            {
                if (
                    this.next()?.match(/[a-zA-Z0-9]/)
                )
                {
                    this.state(LexerState.OpenTagParsing);
                    break;
                }

                if (this.next() === "/")
                {
                    this.state(LexerState.CloseTagParsing);
                    break;
                }

                if (this.next() === "!")
                {
                    if (this.peek(2) === "-" && this.peek(3) === "-")
                    {
                        this.state(LexerState.Comment);
                        break;
                    }

                    this.state(LexerState.Declaration);
                    break;
                }

                if (this.next() === "?")
                {
                    this.state(LexerState.ProcessingInstruction);
                    break;
                }
            }

            text += this.current();
            this.advance();
        }

        if (text.length > 0)
        {
            return {
                kind: TokenType.Text,
                position: this.position(),
                text,
            };
        }

        // we found no text.. lets repeat the process
        return this.nextToken();
    }

    // Parses html tags like <tag></tag> or <tag />
    protected parseOpenTag(): Token | null
    {
        if (this.skipWhitespaces())
        {
            return null;
        }

        if (this.current() === "<")
        {
            this.advance();
            return {
                kind: TokenType.OpenTag,
                position: this.position(),
            };
        }

        // Close tag
        if (this.current() === ">")
        {
            this.state(LexerState.TextParsing);
            this.advance();
            return {
                kind: TokenType.CloseTag,
                position: this.position(),
            };
        }

        if (this.current() === "/" && this.next() === ">")
        {
            this.state(LexerState.TextParsing);
            this.advance(2);
            return {
                kind: TokenType.SelfCloseTag,
                position: this.position(),
            };
        }

        const tokenMap: Record<string, CommonTokenTypes> = {
            "=": TokenType.Equals,
            "[": TokenType.OpenBracket,
            "]": TokenType.CloseBracket,
            "*": TokenType.Multiply,
            "(": TokenType.OpenParenthesis,
            ")": TokenType.CloseParenthesis,
            ".": TokenType.Dot,
        }

        const tokenType = tokenMap[this.current()] ?? null;
        if (tokenType)
        {
            this.advance();
            return {
                kind: tokenType,
                position: this.position(),
            };
        }

        // parse string literals
        if (this._input[this.index].match(/["'`]/))
        {
            return this.parseStringLiteral();
        }

        let identifier = this.parseIdentifier(/[a-zA-Z0-9-\.]/, /[\s\/=\[\]<>\*\(\)'"`]/);
        if (identifier)
        {
            return identifier;
        }


        throw this.error(`Unexpected character '${this.current()}' in tag open`);
    }

    protected parseCloseTag(): Token | null
    {
        if (this.skipWhitespaces())
        {
            return null;
        }

        const tokenMap: Record<string, CommonTokenTypes> = {
            "<": TokenType.OpenTag,
            "/": TokenType.Slash,
        }

        let tokenType = tokenMap[this.current()] ?? null;
        if (tokenType)
        {
            this.advance();

            return {
                kind: tokenType,
                position: this.position(),
            };
        }

        if (this.current() === ">")
        {
            this.state(LexerState.TextParsing);
            this.advance();

            return {
                kind: TokenType.CloseTag,
                position: this.position(),
            };
        }

        let identifier = this.parseIdentifier(/[a-zA-Z0-9-\.]/, /[\s>]/);
        if (identifier)
        {
            return identifier;
        }

        throw this.error(`Unexpected character '${this.current()}' in close tag`);
    }

    protected parseIdentifier(identifierPattern: RegExp, stopPattern: RegExp): IdentifierToken | null
    {
        let identifier = "";
        while (this.canAdvance)
        {
            // parse identifier 
            if (this.current().match(identifierPattern))
            {
                identifier += this.current();
                this.advance();
                continue;
            }

            // if space or slash is found, return identifier
            // and set the state to Text
            if (this.current().match(stopPattern))
            {
                if (identifier.length === 0)
                {
                    throw this.error(`Expected identifier in tag open, but got '${this.current()}'`);
                }

                return {
                    kind: TokenType.Identifier,
                    position: this.position(),
                    name: identifier,
                };
            }

            throw this.error(`Unexpected character '${this.current()}' in identifier`);
        }

        return null;
    }

    // Parse declaration like <!DOCTYPE html>
    protected parseDeclaration(): Token | null
    {
        if (this.skipWhitespaces())
        {
            return null;
        }

        if (
            this._input[this.index] !== '<' ||
            this._input[this.index + 1] !== '!' ||
            this._input.slice(this.index + 2, this.index + 9).toUpperCase() !== "DOCTYPE"
        )
        {
            throw this.error(`Expected '<!DOCTYPE html>' declaration, but got '${this._input.slice(this.index, this.index + 10)}'`);
        }
        this.advance(9); // advance past <!DOCTYPE

        if (this.skipWhitespaces())
        {
            return null;
        }

        const name = this.parseIdentifier(/[a-zA-Z]/, /[^a-zA-Z]/); // expects 'html'
        if (name === null)
        {
            throw this.error(`Expected identifier in <!DOCTYPE html>, but got '${this.current()}'`);
        }

        if (this.skipWhitespaces())
        {
            return null;
        }

        if (this.current() !== '>')
        {
            throw this.error(`Expected '>' at end of DOCTYPE declaration, but got '${this.current()}'`);
        }
        this.advance(); // advance past '>'

        this.state(LexerState.TextParsing);

        return {
            kind: TokenType.HtmlDeclaration,
            position: this.position(),
            declaration: name.name,
        }
    }

    protected parseComment(): Token | null
    {
        if (this.skipWhitespaces())
        {
            return null;
        }

        // Check if <!-- is found
        if (this.current() == "<" && this.next() === "!" && this.peek(2) === "-" && this.peek(3) === "-")
        {
            this.advance(4);
            let comment = "";

            while (this.canAdvance)
            {
                // parse until -->
                if (this.current() == "-" && this.next()! == "-" && this.peek(2)! === ">")
                {
                    this.advance(3);
                    break;
                }

                // escape character
                if (this.current() === "\\")
                {
                    this.advance();
                    const nextCh = this._input[this.index];
                    if (nextCh === "-" || nextCh === ">")
                    {
                        comment += nextCh;
                        this.advance();
                        continue;
                    }

                    throw this.error(`Invalid escape sequence '\\${nextCh}'`);
                }

                comment += this.current();
                this.advance();
            }

            this.state(LexerState.TextParsing);

            return {
                kind: TokenType.HtmlComment,
                position: this.position(),
                comment: comment,
            };
        }

        this.error(`Expected comment, but got '${this.current()}'`);

        return null;
    }

    protected parseProcessingInstruction(): Token | null
    {
        return null;
    }

    protected parseStringLiteral(): Token | null
    {
        Logger.verbose("Parsing string literal", "Lexer");

        if (this.skipWhitespaces())
        {
            return null;
        }

        if (this._input[this.index].match(/["'`]/))
        {
            const quote = this._input[this.index];
            this.advance();
            let value = "";
            while (this.canAdvance)
            {
                const ch = this._input[this.index];
                if (ch === quote)
                {
                    break;
                }

                // escape character
                if (ch === "\\")
                {
                    this.advance();
                    const nextCh = this._input[this.index];
                    if (nextCh === quote || nextCh === "\\" || nextCh === "n" || nextCh === "r" || nextCh === "t")
                    {
                        value += nextCh;
                        this.advance();
                        continue;
                    }

                    throw this.error(`Invalid escape sequence '\\${nextCh}'`);
                }

                value += ch;
                this.advance();
            }

            if (this.index >= this.length)
            {
                throw this.error(`Unterminated string literal`);
            }

            this.advance();
            return {
                kind: TokenType.String,
                position: this.position(),
                value,
            };
        }

        return null;
    }

    // returns true if we parsed a whitespace character, and false if we hit the end of the stream
    protected skipWhitespaces(): boolean
    {
        while (this.canAdvance)
        {
            const ch = this._input[this.index];
            if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r")
            {
                this.advance();
                continue;
            }

            break;
        }

        return this.isEOF;
    }
};

/*
*   DEBUG UTILITIES
*/
export function tokenValueToString(token: Token): string | null
{
    switch (token.kind)
    {
        case "TEXT":
            return token.text;
        case "IDENTIFIER":
            return token.name;
        case "NUMBER":
            return token.value.toString();
        case "STRING":
            return token.value;
        case "HTML_COMMENT":
            return token.comment;
        case "HTML_DECLARATION":
            return token.declaration;
        default:
            return null;
    }
}