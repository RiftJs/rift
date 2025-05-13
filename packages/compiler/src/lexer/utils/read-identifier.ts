import { LexerContext } from "../context";
import { isAlphaNumeric, isDigit } from "./charcode";

/**
 * Reads an identifier from the current context.
 * An identifier is a sequence of characters that starts with a letter or underscore,
 * followed by letters, digits, or underscores.
 *
 * @param context - The lexer context to read from.
 * @returns The identifier string, or null if no valid identifier is found.
 */
export function readIdentifier(
    context: LexerContext,
): string | null
{
    let identifier = "";

    // Identifiers may not start with a digit
    if (!isDigit(context.current() || ""))
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
            isAlphaNumeric(character)
            || character === "_" // underscore (_)
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