import { createNode } from "../../document/node";
import { LexerMode } from "../../lexer/lexer";
import { HtmlCommentToken, HtmlTextToken, ScriptCodeToken, Token, TokenKind } from "../../lexer/tokens";
import { RiftParserContext } from "../context";

export function parseHtmlTextNode(
    context: RiftParserContext,
    token: HtmlTextToken,
): boolean
{
    let current = context.getCurrentNode();

    let textNode = createNode("html-text", token.position, {
        content: token.text,
    });
    current.addChild(textNode);

    return true;
}

export function parseHtmlTagStartNode(
    context: RiftParserContext,
    token: Token,
): boolean
{
    let current = context.getCurrentNode();

    // let tagNode = createNode("html-element", token.position, {
    //     name: token.na,
    //     attributes: [],
    //     bindings: [],
    //     directives: [],
    // });
    // current.addChild(tagNode);
    // context.pushNode(tagNode);

    context.lexer.pushMode(LexerMode.HtmlTag);


    let tagName = context.next()
    if (!tagName || tagName.kind !== TokenKind.Identifier)
    {
        throw context.error(`Expected tag name, but got '${tagName ? tagName.kind : "EOF"}'`, token);
    }





    // // parse attributes
    // while (true)
    // {
    //     let nextNode = context.lexer.peek(1);
    //     if (!nextNode)
    //     {
    //         throw context.error("Unexpected end of file", token);
    //         break;
    //     }

    //     // if(nextNode.kind)
    //     // context.expect(TokenKind.Identifier, 1);

    // }

    // let nextNode = context.lexer.next();
    // if(nextNode?.kind)
    // {
    //     switch (nextNode.kind)
    //     {
    //         case "html-attribute":
    //             parseHtmlTextNode(context, nextNode);
    //             break;
    //         case "html-tag-end":
    //             context.lexer.popMode();
    //             context.popNode();
    //             break;
    //         default:
    //             throw context.error(`Unexpected token: ${nextNode.kind}`, nextNode);
    //     }
    // }


    // Expect the end of the tag
    context.expect(TokenKind.HtmlTagEnd);
    context.consume(1);
    context.lexer.popMode();

    if (tagName.identifier === "script")
    {
        context.lexer.pushMode(LexerMode.Script);
    }

    return true;
}

export function parseHtmlTagEndNode(
    context: RiftParserContext,
    token: Token,
): boolean
{
    let current = context.getCurrentNode();

    return true;
}


export function parseHtmlCommentNode(
    context: RiftParserContext,
    token: HtmlCommentToken,
): boolean
{
    let current = context.getCurrentNode();

    let commentNode = createNode("html-comment", token.position, {
        comment: token.comment,
    });
    current.addChild(commentNode);

    return true;
}

export function parseScriptCode(
    context: RiftParserContext,
    token: ScriptCodeToken,
): boolean
{
    let current = context.getCurrentNode();

    let scriptNode = createNode("html-script", token.position, {
        content: token.code,
    });
    current.addChild(scriptNode);

    return true;
}