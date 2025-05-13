import { LexerContext } from "../context";
import { isAlphaNumericUTF8, isAlphaUTF8, isDigit, isHexDigit } from "./charcode";
import { readNumberLiteral } from "./literals";

// parse values (e.g., "10px", "20%", "1.5em", etc.) in CSS.
const VALID_CSS_UNITS = new Set([
    "px", "em", "rem", "%", "vh", "vw", "vmin", "vmax",
    "cm", "mm", "in", "pt", "pc", "ex", "ch", "fr"
]);

export function readCSSDimension(context: LexerContext): { value: number, unit: string } | null
{
    const start = context.index;

    const number = readNumberLiteral(context);
    if (number === null)
    {
        return null;
    }

    let unit = "";
    while (context.index < context.length)
    {
        const ch = context.input[context.index];
        if (isAlphaUTF8(ch) || ch === "%")
        {
            unit += ch;
            context.advance(1);
        } else
        {
            break;
        }
    }

    if (!unit || !VALID_CSS_UNITS.has(unit))
    {
        context.index = start;
        return null;
    }

    return { value: number, unit };
}



/**
 * Reads an identifier from the current context.
 * An identifier is a sequence of characters that starts with a letter or underscore,
 * followed by letters, digits, or underscores.
 *
 * @param context - The lexer context to read from.
 * @returns The identifier string, or null if no valid identifier is found.
 */
export function readCSSIdentifier(
    context: LexerContext,
): string | null
{
    let identifier = "";

    let startCharacter = context.current() || "";
    if (!isAlphaUTF8(startCharacter) && startCharacter !== "_" && startCharacter !== "-")
    {
        return null;
    }

    while (context.index < context.length)
    {
        const character = context.current();
        if (!character)
        {
            break;
        }

        if (
            isAlphaNumericUTF8(character)
            || character === "_" // underscore (_)
            || character === "-" // hyphen (-)
        )
        {
            identifier += character;
            context.advance(1);
        }
        else
        {
            // Invalid character for identifier, break out of the loop
            break;
        }
    }

    return identifier.length > 0 ? identifier : null;
}

export function readCSSColorHexadecimal(context: LexerContext): string | null
{
    const start = context.index;

    if (context.current() !== "#")
    {
        return null;
    }

    let index = start + 1;
    let hex = "";

    while (index < context.length)
    {
        const ch = context.input[index];
        if (!isHexDigit(ch)) break;
        hex += ch;
        index++;
    }

    // Valid hex color lengths: 3, 4, 6, 8
    if (hex.length !== 3 && hex.length !== 4 && hex.length !== 6 && hex.length !== 8)
    {
        return null;
    }

    // Accept: advance real position
    context.advance(index - start);
    return "#" + hex;
}

export function readCSSComment(context: LexerContext): string | null
{
    const start = context.index;

    if (context.current() !== "/")
    {
        return null;
    }

    context.advance(1); // Skip the first "/"

    if (context.current() !== "*")
    {
        context.index = start; // Reset index if not a comment
        return null;
    }

    context.advance(1); // Skip the "*"

    let comment = "";

    while (context.index < context.length)
    {
        const character = context.current();
        if (!character)
        {
            break;
        }

        if (character === "*" && context.input[context.index + 1] === "/")
        {
            context.advance(2); // Skip "*/"
            break;
        }

        comment += character;
        context.advance(1);
    }

    return comment.length > 0 ? comment : null;
}