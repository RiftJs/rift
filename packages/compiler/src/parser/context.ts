import { RiftModuleNode } from "../document/module.node";
import { RiftNode, RiftNodeKind, RiftNodeType } from "../document/node";
import { CompilerError } from "../error/error";
import { Lexer } from "../lexer/lexer";
import { Token, TokenKind } from "../lexer/tokens";
import { RiftParser } from "./parser";

/**
 * RiftParserContext manages parser state, including the node stack and lexer.
 * Provides utility methods for error handling, token management, and AST node stack operations.
 */
export class RiftParserContext
{
    /**
     * Stack of AST nodes representing the current parse context.
     */
    public nodeStack: RiftNode[] = [];

    /**
     * @param parser The parent RiftParser instance.
     * @param lexer The lexer used for tokenization.
     * @param module The root module node for the AST.
     */
    constructor(
        public parser: RiftParser,
        public lexer: Lexer,
        public module: RiftModuleNode,
    )
    {
    }

    /**
     * Throws and emits a CompilerError with the given message and optional token.
     */
    public error(message: string, token?: Token): CompilerError
    {
        let error = new CompilerError("ParserError", message, token?.position ?? this.lexer.position());
        this.parser.events.emit("error", error);
        return error;
    }

    /**
     * Asserts the next token is of the expected type, or throws an error.
     */
    public expect<T extends TokenKind>(type: T, offset: number = 0): Extract<Token, { kind: T }>
    {
        const token = this.lexer.peek(offset);
        if (token === null || token.kind !== type)
        {
            throw this.error(`Expected token of type ${type}, but got ${token ? token.kind : "null"}`, token ?? undefined);
        }

        return token as Extract<Token, { kind: T }>;
    }

    /**
     * Consumes the specified number of tokens.
     */
    public consume(amount: number = 1): void
    {
        this.lexer.consume(amount);
    }

    /**
     * Peeks at a token at the given offset without consuming it.
     */
    public peek(offset: number = 0): Token | null
    {
        return this.lexer.peek(offset);
    }

    /**
     * Returns the next token and advances the lexer.
     */
    public next(): Token | null
    {
        return this.lexer.next();
    }

    /**
     * Returns the current AST node from the stack.
     */
    public getCurrentNode<K extends RiftNodeKind>(): RiftNodeType<K>
    {
        if (this.nodeStack.length === 0)
        {
            throw new Error("No current node");
        }

        return this.nodeStack[this.nodeStack.length - 1] as RiftNodeType<K>;
    }

    /**
     * Pushes a node onto the node stack.
     */
    public pushNode(node: RiftNode): void
    {
        this.nodeStack.push(node);
    }

    /**
     * Pops a node from the node stack.
     */
    public popNode(): RiftNode | null
    {
        if (this.nodeStack.length === 0)
        {
            return null;
        }

        return this.nodeStack.pop()!;
    }

};