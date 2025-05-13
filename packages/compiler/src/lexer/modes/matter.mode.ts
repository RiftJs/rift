import { LexerContext } from "../context";
import { Token, TokenKind } from "../tokens";

// Matter mode is simply parsing Typescript between --- <content> --- tags
const tokens: Record<string, TokenKind> = {
};

export function matterMode(
    context: LexerContext,
): Token | null
{

    if (context.index !== 0)
    {
        throw context.error("Matter mode can only be used at the start of the file");
    }

    if (context.index === 0)
    {
        // If no matter tag is found, return an empty token
        if (!context.remaining.startsWith("---\n") && !context.remaining.startsWith("---\r"))
        {
            return context.token(TokenKind.MatterContent, { content: "" });
        }

        if (context.remaining.startsWith("---\n\r"))
        {
            context.advance(5);
        }

        if (context.remaining.startsWith("---\r"))
        {
            context.advance(4);
        }

    }

    let start = context.index;
    let inString: '"' | "'" | null = context.getState("matter.inString", null);
    let inTemplate = context.getState("matter.inTemplate", false);
    let escaped = context.getState("matter.escaped", false);

    while (!context.eof())
    {
        let c = context.current();

        // End matter tag
        if (!inString && !inTemplate && context.remaining.startsWith("\r---"))
        {
            context.advance(4);
            let code = context.input.slice(start, context.index - 4);
            return context.token(TokenKind.MatterContent, { content: code });
        }


        if (!inString && !inTemplate && context.remaining.startsWith("\r\n---"))
        {
            context.advance(5);
            let code = context.input.slice(start, context.index - 5);
            return context.token(TokenKind.MatterContent, { content: code });
        }

        // String logic
        if (!inString && (c === '"' || c === "'"))
        {
            inString = c;
            context.setState("matter.inString", inString);
        } else if (inString && c === inString && !escaped)
        {
            inString = null;
            context.setState("matter.inString", null);
        }

        // Template literal logic
        if (!inString && c === "`")
        {
            inTemplate = !inTemplate;
            context.setState("matter.inTemplate", inTemplate);
        }

        escaped = c === "\\" && !escaped;
        context.setState("matter.escaped", escaped);

        context.advance(1);
    }

    // Final flush
    if (context.index > start)
    {
        let code = context.input.slice(start, context.index);
        return context.token(TokenKind.MatterContent, { content: code });
    }

    return null;
}