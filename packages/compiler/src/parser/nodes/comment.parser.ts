import { HtmlCommentToken } from "../../lexer/tokens";
import { ParserContext } from "../context";

export function parseComment(context: ParserContext, token: HtmlCommentToken): boolean
{
    let commentNode = context.createChildNode("comment", token.position, {
        comment: token.comment,
    });

    context.parser.events.emit("comment", commentNode);

    return true;
}
