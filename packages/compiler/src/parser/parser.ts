import EventEmitter from "events";
import { debugInspectToken } from "../diagnostics/inspect";
import { RiftModuleNode } from "../document/module.node";
import { createNode, RiftNode } from "../document/node";
import { CompilerError } from "../error/error";
import { Lexer, LexerMode } from "../lexer/lexer";
import { MatterContentToken, Token, TokenKind } from "../lexer/tokens";
import { RiftSource } from "../source/source";
import { RiftParserContext } from "./context";
import { parseHtmlCommentNode, parseHtmlTagStartNode, parseHtmlTextNode, parseScriptCode } from "./parsers/html.parser";
import { parseRiftExpression, parseRiftInterpolationStart } from "./parsers/rift.parser";

type TokenHandler<T extends Token = Token> = (context: RiftParserContext, token: T) => boolean;
type ParserMap = {
    [K in TokenKind]?: TokenHandler<Extract<Token, { kind: K }>>;
};

type RiftParserEvents = {
    // Parser state
    parseStart: [];
    parseComplete: [];

    // Generic events
    error: [CompilerError];
    node: [RiftNode];

    // // Document events
    // tagOpen: [ElementNode];
    // tagAttribute: [ElementNode, ElementAttribute];
    // tagBinding: [ElementNode, ElementBinding];
    // tagDirective: [ElementNode, ElementDirective];
    // tagClose: [ElementNode];
    // text: [TextNode];
    // comment: [CommentNode];
    // documentDeclaration: [DocumentDeclaration];

    // // rift events
    // blockStart: [RiftNode];
    // blockEnd: [RiftNode];
    // foreachStart: [RiftNode];
    // foreachEnd: [RiftNode];
};

export class RiftParser
{
    public context: RiftParserContext;
    // Parser state
    public events: EventEmitter<RiftParserEvents> = new EventEmitter<RiftParserEvents>();

    public tokenHandlerMap: ParserMap = {
        [TokenKind.HtmlText]: parseHtmlTextNode,
        [TokenKind.HtmlComment]: parseHtmlCommentNode,
        [TokenKind.HtmlTagStart]: parseHtmlTagStartNode,
        [TokenKind.ScriptCode]: parseScriptCode,
        [TokenKind.TemplateInterpolationStart]: parseRiftInterpolationStart,
        //[TokenKind.HtmlTagEnd]: parseHtmlTagEndNode,
    };

    constructor(
        source: RiftSource,
    )
    {
        let lexer = new Lexer(source);
        let root = createNode("rift-module", lexer.position(), {
            source: source,
        });
        this.context = new RiftParserContext(this, lexer, root);
        this.context.pushNode(root);
    }

    public parse(): RiftModuleNode
    {
        // Parse front matter
        this.context.lexer.pushMode(LexerMode.Matter);
        let matterContent = this.context.lexer.next() as MatterContentToken
        if (matterContent === null)
        {
            throw this.context.error("Unexpected end of file");
        }
        console.log("Matter content", matterContent.content);
        this.context.lexer.popMode();

        this.events.emit("parseStart");
        let lexer = this.context.lexer;
        while (true)
        {
            let token = lexer.next();
            if (token === null)
            {
                break;
            }

            let parser = this.tokenHandlerMap[token.kind] as TokenHandler<Token>;
            if (!parser)
            {
                console.log("Token:", debugInspectToken(token));
                throw this.context.error(`Unexpected token: ${token.kind}`, token);
            }

            if (!parser(this.context, token))
            {
                throw this.context.error(`Error parsing token: ${token.kind}`, token);
            }

        }

        return this.context.module;
    }


};