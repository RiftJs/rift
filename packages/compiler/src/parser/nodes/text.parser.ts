import { TextToken } from "../../lexer/tokens";
import { ParserContext } from "../context";

/*
* Parse a text node
*/
export function parseText(context: ParserContext, token: TextToken): boolean
{
    let textNode = context.createChildNode("text", token.position, {
        text: token.text,
    });

    context.parser.events.emit("text", textNode);
    return true;
}