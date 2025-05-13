import { Lexer, LexerMode } from "../../lexer/lexer";
import { Token, TokenKind } from "../../lexer/tokens";
import { RiftParserContext } from "../context";

export function parseRiftInterpolationStart(
    context: RiftParserContext,
    token: Token,
): boolean
{
    // let current = context.getCurrentNode();

    // if (current.kind !== "rift-interpolation-start")
    // {
    //     throw context.error("Expected a rift interpolation start node", token);
    // }

    // // Parse the interpolation start here
    // // For example, you might want to parse a variable or expression.

    // // Example: Just setting the content to the token value for demonstration
    // current.content = token.value;

    context.lexer.pushMode(LexerMode.Rift);

    while (true)
    {
        let token = context.next();
        if (!token)
        {
            throw context.error("Unexpected end of file");
        }

        if (token.kind == TokenKind.TemplateInterpolationEnd)
        {
            break;
        }
    }

    return true;
}

export function parseRiftExpression(
    context: RiftParserContext,
    token: Token,
): boolean
{
    let current = context.getCurrentNode();

    // if (current.kind !== "rift-expression")
    // {
    //     throw context.error("Expected a rift expression node", token);
    // }

    // // Parse the expression here
    // // For example, you might want to parse a simple arithmetic expression
    // // or a more complex expression based on your requirements.

    // // Example: Just setting the content to the token value for demonstration
    // current.content = token.value;

    return true;
}