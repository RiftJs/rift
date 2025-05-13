import EventEmitter from "events";
import { RiftSource } from "../source/source";
import { Logger } from "../utils/logger";
import { LexerContext } from "./context";
import { cssMode } from "./modes/css.mode";
import { htmlTagMode } from "./modes/html-tag.mode";
import { htmlTextMode } from "./modes/html-text.mode";
import { Token } from "./tokens";
import { matterMode } from "./modes/matter.mode";
import { scriptMode } from "./modes/script.mode";
import { SourcePosition } from "../utils/source-position";

export enum LexerMode
{
    Matter = "Matter",
    HtmlText = "HtmlText",
    HtmlTag = "HtmlTag",
    Css = "Css",
    Script = "Script",
    Rift = "Rift",

    // String = "string",
    // Comment = "comment",
    // BlockComment = "blockComment",
    // Regex = "regex",
    // TemplateString = "templateString",
};

export type LexerEventMap = {
    reset: [];
    token: [Token];
    error: [Error];
}

export class Lexer
{
    protected _context: LexerContext;
    protected _modes: { [K in LexerMode]?: (context: LexerContext) => Token | null } = {
        [LexerMode.Matter]: matterMode,
        [LexerMode.HtmlText]: htmlTextMode,
        [LexerMode.HtmlTag]: htmlTagMode,
        [LexerMode.Css]: cssMode,
        [LexerMode.Script]: scriptMode,
    };
    protected _modeStack: LexerMode[] = [];

    protected _buffer: Token[] = [];
    protected _bufferIndex = 0;

    public events: EventEmitter<LexerEventMap> = new EventEmitter();

    public last(): Token | null
    {
        return this._buffer[this._bufferIndex - 1] ?? null;
    }

    public current(): Token | null
    {
        return this._buffer[this._bufferIndex] ?? null;
    }

    constructor(
        source: RiftSource
    )
    {
        this._context = new LexerContext(this, source);
        this._modeStack = [LexerMode.HtmlText];
    }

    // Sets the input string and resets the lexer state
    public reset(): void
    {
        this._context.reset();
        this.events.emit("reset");
        this._modeStack = [LexerMode.HtmlText];
    }

    /*
    * Returns the next token without consuming it.
    * If there are no more tokens, it returns null.
    */
    public peek(offset: number): Token | null
    {
        while (this._bufferIndex + offset >= this._buffer.length)
        {
            const next = this._mode();
            if (!next)
            {
                break;
            }

            this._buffer.push(next);
        }

        return this._buffer[this._bufferIndex + offset] ?? null;
    }

    /*
    * Returns the next token without consuming it.
    * If there are no more tokens, it returns null.
    */
    public next(): Token | null
    {
        const token = this.peek(0);
        if (token)
        {
            this._bufferIndex++;
            Logger.verbose(`Parsed token: ${token?.kind}`, "Lexer");
        }
        return token;
    }

    /*
    * Consumes the current token and returns the next one.
    * If there are no more tokens, it returns null.
    */
    public consume(amount: number): void
    {
        this._bufferIndex += amount;
    }

    /*
    * Lexer Mode Functions
    */

    // Parses the next token based on the current mode
    protected _mode(): Token | null
    {
        let currentMode = this.getMode();
        if (!currentMode)
        {
            throw this._context.error(`Lexer mode is not set`);
        }

        let modeFunction = this._modes[currentMode];
        if (!modeFunction)
        {
            throw this._context.error(`Lexer mode ${currentMode} is not implemented`);
        }

        let token = modeFunction(this._context);
        if (token)
        {
            this.events.emit("token", token);
        }

        return token;
    }

    // Pushes a new mode onto the stack
    public pushMode(mode: LexerMode)
    {
        this._modeStack.push(mode);
        Logger.warning(`Pushed mode: ${mode}`, "Lexer");
    }

    // Pops the current mode off the stack
    public popMode()
    {
        Logger.warning(`Popped mode: ${this._modeStack[this._modeStack.length - 1]}`, "Lexer");
        this._modeStack.pop();
    }

    public getMode(): LexerMode
    {
        return this._modeStack[this._modeStack.length - 1] ?? LexerMode.HtmlText;
    }

    public buffer(): Token[]
    {
        return this._buffer;
    }

    public position(): SourcePosition
    {
        return this._context.position();
    }
};