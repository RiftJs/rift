import { LexerContext } from "../context";
import { isBackTick, isDigit, isQuote, isWhitespace } from "./charcode";

/**
 * Reads a string literal from the current context.
 * A string literal is defined as a sequence of characters enclosed in quotes (single, double, or backtick).
 *
 * @param context - The lexer context to read from.
 * @returns The string literal, or null if no valid string literal is found.
 */
export function readStringLiteral(
    context: LexerContext,
): string | null
{
    let literal = "";

    // Read the first character ' or " or `
    let quote = context.current();

    if (!quote)
    {
        return null;
    }

    // validate the first character
    if (!isQuote(quote) && !isBackTick(quote))
    {
        return null;
    }

    context.advance(1);

    while (context.index < context.length)
    {
        const character = context.current();
        if (!character)
        {
            throw context.error("Unterminated string literal");
        }

        // Closing quote
        if (character == quote)
        {
            context.advance(1);
            break;
        }

        // Escape character
        if (character === "\\") // \
        {
            context.advance(1);

            const nextChar = context.current();
            if (!nextChar)
            {
                throw context.error("Unterminated string literal");
            }


            if (nextChar === quote || nextChar === "\\" || nextChar === "n" || nextChar === "r" || nextChar === "t")
            {
                literal += quote;
                context.advance(1);
                continue;
            }

            throw context.error(`Invalid escape sequence: \\${nextChar}`);
        }

        literal += character;
        context.advance(1);
    }

    if (context.index >= context.length)
    {
        throw context.error("Unterminated string literal");
    }

    return literal;
}

export function readStringTemplateLiteral(
    context: LexerContext,
): string | null
{
    let literal = "";

    // Read the first character `
    let quote = context.current();

    if (!quote)
    {
        return null;
    }

    // validate the first character
    if (!isBackTick(quote))
    {
        return null;
    }

    context.advance(1);

    while (context.index < context.length)
    {
        const character = context.current();
        if (!character)
        {
            throw context.error("Unterminated string literal");
        }

        // Closing quote
        if (character == quote)
        {
            context.advance(1);
            break;
        }

        // Escape character
        if (character === "\\") // \
        {
            context.advance(1);

            const nextChar = context.current();
            if (!nextChar)
            {
                throw context.error("Unterminated string literal");
            }
            if (nextChar === quote || nextChar === "\\" || nextChar === "n" || nextChar === "r" || nextChar === "t")
            {
                literal += quote;
                context.advance(1);
                continue;
            }
            throw context.error(`Invalid escape sequence: \\${nextChar}`);
        }
        // Interpolation
        else if (character === "$" && context.peek(1) === "{")
        {
            context.advance(2);
            literal += "${";
            const expression = readStringTemplateLiteral(context);
            if (!expression)
            {
                throw context.error("Unterminated string literal");
            }
            literal += expression + "}";
            continue;
        }
        literal += character;
        context.advance(1);
    }
    if (context.index >= context.length)
    {
        throw context.error("Unterminated string literal");
    }
    return literal;
}


export function readNumberLiteral(context: LexerContext): number | null
{
    const input = context.input;
    const length = context.length;
    let index = context.index;
    let number = "";

    let char = input[index];
    if (!char || (!isDigit(char) && char !== "." && char !== "+" && char !== "-"))
    {
        return null;
    }

    // Optional sign
    if (char === "+" || char === "-")
    {
        number += char;
        char = input[++index];
    }

    let hasDigits = false;

    // Integer part
    while (index < length && isDigit(input[index]))
    {
        number += input[index++];
        hasDigits = true;
    }

    // Decimal point and fractional part
    if (input[index] === ".")
    {
        number += input[index++];
        while (index < length && isDigit(input[index]))
        {
            number += input[index++];
            hasDigits = true;
        }
    }

    // Exponent
    if ((input[index] === "e" || input[index] === "E") && hasDigits)
    {
        number += input[index++];
        if (input[index] === "+" || input[index] === "-")
        {
            number += input[index++];
        }
        let expDigits = false;
        while (index < length && isDigit(input[index]))
        {
            number += input[index++];
            expDigits = true;
        }
        if (!expDigits) return null; // Invalid exponent
    }

    if (!hasDigits)
    {
        return null;
    }

    const parsed = Number(number);
    if (isNaN(parsed)) return null;

    context.advance(index - context.index);
    return parsed;
}


/*
* Parse the words true and false
*/
export function readBooleanLiteral(
    context: LexerContext,
): boolean | null
{
    let character = context.current()
    if (!character)
    {
        return null;
    }

    if (character.toLowerCase() == "t" && context.remaining.slice(0, 4).toLowerCase() == "true" && isWhitespace(context.peek(4) || ""))
    {
        context.advance(4);
        return true;
    }

    if (character.toLowerCase() == "f" && context.remaining.slice(0, 5).toLowerCase() == "false" && isWhitespace(context.peek(5) || ""))
    {
        context.advance(5);
        return false;
    }

    return null;
}