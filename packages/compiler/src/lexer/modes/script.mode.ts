import { LexerContext } from "../context";
import { Token, TokenKind } from "../tokens";

export function scriptMode(
    context: LexerContext,
): Token | null
{
    let start = context.index;
    let inString: '"' | "'" | null = context.getState("script.inString", null);
    let inTemplate = context.getState("script.inTemplate", false);
    let escaped = context.getState("script.escaped", false);

    while (!context.eof())
    {
        let c = context.current();
        let next = context.peek(1);

        // Template interpolation
        if (c === "{" && next === "{")
        {
            if (context.index > start)
            {
                let code = context.input.slice(start, context.index);
                return context.token(TokenKind.ScriptCode, { code });
            }
            context.advance(2);
            return context.token(TokenKind.TemplateInterpolationStart);
        }

        // Template interpolation end
        if (c === "}" && next === "}")
        {
            context.advance(2);
            return context.token(TokenKind.TemplateInterpolationEnd);
        }

        // End script tag
        if (!inString && !inTemplate && context.remaining.startsWith("</script>"))
        {
            if (context.index > start)
            {
                let code = context.input.slice(start, context.index);
                return context.token(TokenKind.ScriptCode, { code });
            }
            context.advance(9);
            return context.token(TokenKind.HtmlTagEnd);
        }

        // String logic
        if (!inString && (c === '"' || c === "'"))
        {
            inString = c;
            context.setState("script.inString", inString);
        } else if (inString && c === inString && !escaped)
        {
            inString = null;
            context.setState("script.inString", null);
        }

        // Template literal logic
        if (!inString && c === "`")
        {
            inTemplate = !inTemplate;
            context.setState("script.inTemplate", inTemplate);
        }

        escaped = c === "\\" && !escaped;
        context.setState("script.escaped", escaped);

        context.advance(1);
    }

    // Final flush
    if (context.index > start)
    {
        let code = context.input.slice(start, context.index);
        return context.token(TokenKind.ScriptCode, { code });
    }

    return null;
}