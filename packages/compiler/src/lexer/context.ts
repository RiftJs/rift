import { CompilerError } from "../error/error";
import { RiftSource } from "../source/source";
import { SourcePosition } from "../utils/source-position";
import { Lexer } from "./lexer";
import { TokenKindOf, TokenOfKind } from "./tokens";


/**
 * LexerContext manages the state and navigation of the input stream during lexical analysis.
 *
 * It tracks the current position (index, line, column) in the input string, provides methods
 * for peeking and advancing through characters, and emits tokens and errors as needed.
 *
 * This context is used by the lexer to tokenize the input source code, handling newlines,
 * whitespace, and error reporting in a consistent manner.
 */
export class LexerContext
{
    /** The full input string being lexed. */
    public input: string = "";
    /** The current index (character offset) in the input string. */
    public index = 0;
    /** The total length of the input string. */
    public length = 0;
    /** The current line number (1-based). */
    public line = 1;
    /** The current column number (1-based). */
    public column = 1;

    /**
     * stored state for the lexer.
     * This is a record that can hold any additional data needed during lexing.
     */
    protected state: Record<string, any> = {};

    /**
     * The remaining input string from the current index to the end.
     * This is a computed property that returns the substring from the current index.
     */
    public get remaining(): string
    {
        return this.input.substring(this.index);
    }
    /**
     * Creates a new LexerContext for the given lexer and source.
     * @param lexer - The parent Lexer instance.
     * @param source - The Source object containing the code.
     */
    constructor(
        /** The parent Lexer instance. */
        public lexer: Lexer,
        /** The Source object containing the code. */
        public source: RiftSource,
    )
    {
        this.input = source.code;
        this.length = source.code.length;
        this.index = 0;
        this.line = 1;
        this.column = 1;
        this.state = {};
    }

    /**
     * Resets the context to the beginning of the input stream.
     * Sets index, line, and column to their initial values.
     */
    public reset(): void
    {
        this.index = 0;
        this.line = 1;
        this.column = 1;
        this.state = {};
    }

    /**
     * Returns the current character at the context's index, or null if out of bounds.
     * @returns The current character or null.
     */
    public current(): string | null
    {
        return this.input[this.index] ?? null;
    }

    /**
     * Peeks ahead in the input stream by the given offset and returns the character, or null if out of bounds.
     * @param offset - The number of characters to look ahead.
     * @returns The character at the offset or null.
     */
    public peek(offset: number): string | null
    {
        return this.input[this.index + offset] ?? null;
    }

    /**
     * Advances the input stream by the specified number of characters, updating line and column numbers.
     * Handles Windows (\r\n) and Unix (\n) newlines correctly.
     * @param offset - The number of characters to advance.
     * @returns True if not at the end of the input, false otherwise.
     */
    public advance(offset: number): boolean
    {
        while (offset-- > 0 && this.index < this.length)
        {
            //console.log("advancing", offset, "[" + escapeWhitespace(this.input[this.index]) + "]");

            // Handle \r\n as a single newline
            if (this.input[this.index] === "\r" && this.input[this.index + 1] === "\n")
            {
                this.index += 2;
                this.line++;
                this.column = 1;
                continue;
            }

            if (this.input[this.index] === "\n" || this.input[this.index] === "\r")
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

        return this.index < this.length;
    }

    /**
     * Returns the current position in the input stream as a SourcePosition object.
     * @returns The current SourcePosition (source, line, column, offset).
     */
    public position(offset: number = 0, length: number = 1): SourcePosition
    {
        if (offset == 0)
        {
            return {
                source: this.source,
                line: this.line,
                column: this.column,
                offset: this.index,
                length: length,
            };
        }

        // Walk back or forth to the offset

        let line = this.line;
        let column = this.column;
        let index = this.index + offset;
        let input = this.input;
        let inputLength = this.length;
        let i = index;
        let char = input[i];
        // Walking forward
        if (offset >= 0)
        {
            i = this.index;
            let target = this.index + offset;

            while (i < target && i < inputLength)
            {
                char = input[i];
                if (char === "\n" || char === "\r")
                {
                    if (char === "\r" && input[i + 1] === "\n") i++;
                    line++;
                    column = 1;
                }
                else column++;
                i++;
            }
        }
        // Walking backward
        else
        {
            i = this.index;
            let target = this.index + offset;

            while (i > target && i >= 0)
            {
                i--;
                char = input[i];
                if (char === "\n" || char === "\r")
                {
                    line--; // approximation
                    column = 1; // or unknown, unless you re-scan previous line
                }
                else column = Math.max(column - 1, 1);
            }
        }
        return {
            source: this.source,
            line: line,
            column: column,
            offset: index,
            length: length,
        };

    }

    /**
     * Creates and emits a CompilerError at the current position.
     * @param message - The error message.
     * @param length - The length of the error span (default: 1).
     * @returns The created CompilerError instance.
     */
    public error(message: string, position?: SourcePosition): CompilerError
    {
        let error = new CompilerError("LexerError", message, position ?? this.position());
        this.lexer.events.emit("error", error);
        return error;
    }

    /**
     * Creates and emits a token of the specified kind and data at the current position.
     * @param kind - The kind of token to create.
     * @param data - Additional data for the token (excluding kind and position).
     * @returns The created token of the specified kind.
     */
    public token<K extends TokenKindOf>(
        kind: K,
        data: Omit<TokenOfKind<K>, "kind" | "position"> = {} as Omit<TokenOfKind<K>, "kind" | "position">,
        length: number = 1,
    ): TokenOfKind<K>
    {
        let token = {
            kind: kind,
            position: this.position(-length, length),
            ...data
        } as TokenOfKind<K>;

        this.lexer.events.emit("token", token);
        return token as TokenOfKind<K>;
    }

    public eof(): boolean
    {
        return this.index >= this.length;
    }

    public getState<T>(key: string, defaultValue?: T): T
    {
        return this.state[key] ?? defaultValue;
    }

    public setState<T = any>(key: string, value: T): void
    {
        this.state[key] = value;
    }

    public clearState(key: string): void
    {
        delete this.state[key];
    }
};