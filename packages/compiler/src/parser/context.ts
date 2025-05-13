import { RiftModuleNode } from "../document/module.node";
import { RiftNode, RiftNodeKind, RiftNodeType } from "../document/node";
import { CompilerError } from "../error/error";
import { Lexer } from "../lexer/lexer";
import { Token, TokenKind } from "../lexer/tokens";
import { RiftParser } from "./parser";

export class RiftParserContext
{
    public nodeStack: RiftNode[] = [];

    constructor(
        public parser: RiftParser,
        public lexer: Lexer,
        public module: RiftModuleNode,
    )
    {
    }

    public error(message: string, token?: Token): CompilerError
    {
        let error = new CompilerError("ParserError", message, token?.position ?? this.lexer.position());
        this.parser.events.emit("error", error);
        return error;
    }

    public expect<T extends TokenKind>(type: T, offset: number = 0): Extract<Token, { kind: T }>
    {
        const token = this.lexer.peek(offset);
        if (token === null || token.kind !== type)
        {
            throw this.error(`Expected token of type ${type}, but got ${token ? token.kind : "null"}`, token ?? undefined);
        }

        return token as Extract<Token, { kind: T }>;
    }

    public consume(amount: number = 1): void
    {
        this.lexer.consume(amount);
    }

    public peek(offset: number = 0): Token | null
    {
        return this.lexer.peek(offset);
    }

    public next(): Token | null
    {
        return this.lexer.next();
    }

    public getCurrentNode<K extends RiftNodeKind>(): RiftNodeType<K>
    {
        if (this.nodeStack.length === 0)
        {
            throw new Error("No current node");
        }

        return this.nodeStack[this.nodeStack.length - 1] as RiftNodeType<K>;
    }

    public pushNode(node: RiftNode): void
    {
        this.nodeStack.push(node);
    }

    public popNode(): RiftNode | null
    {
        if (this.nodeStack.length === 0)
        {
            return null;
        }

        return this.nodeStack.pop()!;
    }

};