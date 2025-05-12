import { RiftDocumentNode } from "../ast/document.node";
import { node, RiftNode, NodeKind, NodeType } from "../ast/node";
import { Lexer } from "../lexer/lexer";
import { Token, TokenKind, TokenPosition } from "../lexer/tokens";
import { Parser } from "./parser";
import { ParserError } from "./parser-error";

type ParserNodeDataMinimal<K extends NodeKind> = Omit<NodeType<K>, "kind" | "children" | "position" | "parent"> & Partial<Pick<NodeType<K>, "children">>;

export class ParserContext
{

    // Parser state
    public rootNode: RiftDocumentNode = node("document", { line: 1, column: 1, offset: 0 }, { declarations: [] });
    public currentNode: RiftNode = this.rootNode;

    constructor(
        public lexer: Lexer,
        public parser: Parser,
    )
    {
    }

    public expect<T extends TokenKind>(type: T, offset: number = 0): Extract<Token, { kind: T }>
    {
        const token = this.lexer.peekToken(offset);
        if (token === null || token.kind !== type)
        {
            throw this.error(`Expected token of type ${type}, but got ${token ? token.kind : "null"}`, this.lexer.position());
        }

        return token as Extract<Token, { kind: T }>;
    }

    public consume(amount: number = 1): void
    {
        this.lexer.consumeToken(amount);
    }

    public peek(offset: number = 0): Token | null
    {
        return this.lexer.peekToken(offset);
    }

    public parentNodeToCurrent(node: RiftNode): void
    {
        this.currentNode.children.push(node);
        node.parent = this.currentNode;
        this.parser.events.emit("node", node);
    }

    public addNodeToCurrent(node: RiftNode): void
    {
        this.currentNode.children.push(node);
        this.parser.events.emit("node", node);
    }

    public createChildNode<K extends NodeKind>(kind: K, position: TokenPosition, data: ParserNodeDataMinimal<K>): NodeType<K>
    {
        const node = {
            ...data,
            kind: kind,
            position: position,
            parent: this.currentNode,
            children: data.children ?? [],
        } as unknown as NodeType<K>;

        this.currentNode.children.push(node);
        this.parser.events.emit("node", node);
        return node;
    }

    public setCurrentNode(node: RiftNode): void
    {
        this.currentNode = node;
    }

    public error(message: string, position: TokenPosition): ParserError
    {
        let error = new ParserError(message, position);
        this.parser.events.emit("error", error);
        return error;
    }

}
