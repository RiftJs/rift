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

/**
 * LexerEventMap defines the events emitted by the Lexer.
 * - reset: Emitted when the lexer is reset.
 * - token: Emitted when a new token is parsed.
 * - error: Emitted when an error occurs during lexing.
 */
export type LexerEventMap = {
    reset: [];
    token: [Token];
    error: [Error];
};

/**
 * LexerMode enumerates the possible parsing modes for the lexer.
 */
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

/**
 * Lexer tokenizes a RiftSource into a stream of tokens, supporting multiple parsing modes.
 * Maintains a mode stack for context-sensitive lexing (HTML, CSS, Script, etc).
 * Emits events for token and error handling.
 */
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

    /**
     * Returns the last token parsed, or null if none.
     */
    public last(): Token | null
    {
        return this._buffer[this._bufferIndex - 1] ?? null;
    }

    /**
     * Returns the current token, or null if none.
     */
    public current(): Token | null
    {
        return this._buffer[this._bufferIndex] ?? null;
    }

    /**
     * Creates a new Lexer for the given source.
     * @param source The RiftSource to tokenize.
     */
    constructor(
        source: RiftSource
    )
    {
        this._context = new LexerContext(this, source);
        this._modeStack = [LexerMode.HtmlText];
    }

    /**
     * Resets the lexer state and mode stack.
     */
    public reset(): void
    {
        this._context.reset();
        this.events.emit("reset");
        this._modeStack = [LexerMode.HtmlText];
    }

    /**
     * Peeks at a token at the given offset without consuming it.
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

    /**
     * Returns the next token and advances the buffer index.
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

    /**
     * Consumes the specified number of tokens.
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

    /**
     * Returns the current lexer mode.
     */
    public getMode(): LexerMode
    {
        return this._modeStack[this._modeStack.length - 1] ?? LexerMode.HtmlText;
    }

    /**
     * Returns the internal token buffer.
     */
    public buffer(): Token[]
    {
        return this._buffer;
    }

    /**
     * Returns the current source position.
     */
    public position(): SourcePosition
    {
        return this._context.position();
    }
};