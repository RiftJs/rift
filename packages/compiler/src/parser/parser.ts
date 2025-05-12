import { EventEmitter } from "events";
import { CommentNode } from "../ast/comment.node";
import { RiftDocumentNode } from "../ast/document.node";
import { ElementAttribute, ElementBinding, ElementDirective, ElementNode } from "../ast/element.node";
import { RiftNode } from "../ast/node";
import { TextNode } from "../ast/text.node";
import { Lexer } from "../lexer/lexer";
import { Token, TokenType } from "../lexer/tokens";
import { Logger } from "../utils/logger";
import { ParserContext } from "./context";
import { parseComment } from "./nodes/comment.parser";
import { parseDeclaration } from "./nodes/declaration.parser";
import { parseElement } from "./nodes/element.parser";
import { parseText } from "./nodes/text.parser";
import { ParserError } from "./parser-error";
import { parseStatement } from "./nodes/statement.parser";

type ParseHandler<T extends Token = Token> = (context: ParserContext, token: T) => boolean;
type ParserMap = {
    [K in TokenType]?: ParseHandler<Extract<Token, { kind: K }>>;
};

type ParserEvents = {
    // Parser state
    parseStart: [];
    parseComplete: [];

    // Generic events
    error: [ParserError];
    node: [RiftNode];

    // Document events
    tagOpen: [ElementNode];
    tagAttribute: [ElementNode, ElementAttribute];
    tagBinding: [ElementNode, ElementBinding];
    tagDirective: [ElementNode, ElementDirective];
    tagClose: [ElementNode];
    text: [TextNode];
    comment: [CommentNode];
    declaration: [RiftDocumentNode];

    // rift events
    blockStart: [RiftNode];
    blockEnd: [RiftNode];
    foreachStart: [RiftNode];
    foreachEnd: [RiftNode];
};

export class Parser
{
    // Parser state
    public events: EventEmitter<ParserEvents> = new EventEmitter<ParserEvents>();

    // Parser state
    protected context: ParserContext;

    public get document(): RiftDocumentNode
    {
        return this.context.rootNode;
    }
    
    protected parserMap: ParserMap = {
        [TokenType.Text]: parseText,
        [TokenType.OpenTag]: parseElement,
        [TokenType.HtmlComment]: parseComment,
        [TokenType.HtmlDeclaration]: parseDeclaration,
        [TokenType.Statement]: parseStatement,
        [TokenType.OpenCurlyBracket]: parseStatement,
        [TokenType.CloseCurlyBracket]: parseStatement,
    };

    constructor(
        protected lexer: Lexer
    )
    {
        this.context = new ParserContext(this.lexer, this);
    }

    public parse(): RiftDocumentNode
    {
        this.events.emit("parseStart");
        while (this.parseNode())
        {
        }

        // Validate that the current node is the root node, after parsing
        if (this.context.currentNode !== this.context.rootNode)
        {
            throw this.context.error(`Unexpected end of file, expected closing tag for <${this.context.currentNode.kind}> but got none`, this.context.currentNode.position);
        }

        this.events.emit("parseComplete");
        return this.context.rootNode;
    }

    public parseNode(): boolean
    {
        let token = this.lexer.nextToken();
        if (token === null)
        {
            return false;
        }

        let parser = this.parserMap[token.kind] as ParseHandler<Token>;

        if (!parser)
        {
            throw this.context.error(`Unexpected token: ${token.kind}`, token.position);
        }

        return parser(this.context, token);
    }

    public debugPrint()
    {
        debugAST(this.context.rootNode);
    }
}

/*
* Debug utilities
*/
function debugAST(document: RiftDocumentNode)
{
    Logger.log("AST:");
    // Iterate through the AST and print out the nodes in a tree-like structure
    function printNode(node: RiftNode, depth: number = 0)
    {
        const indent = "    ".repeat(depth);
        Logger.log(`${indent}${node.kind}`);

        if (node.kind === "element")
        {
            Logger.log(`${indent}    - [${node.name}]`);
            // Logger.log(`${indent}  Attributes: ${JSON.stringify(node.attributes)}`);
            // Logger.log(`${indent}  Bindings: ${JSON.stringify(node.bindings)}`);
            // Logger.log(`${indent}  Directives: ${JSON.stringify(node.directives)}`);
        }

        for (const child of node.children)
        {
            printNode(child, depth + 1);
        }
    }
    printNode(document);
    Logger.log("AST END");
}