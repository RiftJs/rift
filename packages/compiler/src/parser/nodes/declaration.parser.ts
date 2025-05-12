import { DeclarationToken } from "../../lexer/tokens";
import { ParserContext } from "../context";

export function parseDeclaration(context: ParserContext, token: DeclarationToken): boolean
{
    if (context.rootNode.children.length > 0)
    {
        throw context.error(`Unexpected declaration: ${token.kind}, declarations must be the first node`, token.position);
    }

    context.rootNode.declarations.push({
        name: token.declaration,
        attributes: [],
        elements: [],
        value: "",
    });

    context.parser.events.emit("declaration", context.rootNode);
    
    return true;
}
