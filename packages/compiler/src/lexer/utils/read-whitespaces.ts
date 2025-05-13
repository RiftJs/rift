import { LexerContext } from "../context";
import { isAlphaNumeric, isWhitespace } from "./charcode";

/**
 * Reads a sequence of whitespace characters from the current context.
 * A whitespace character is defined as a space, tab, newline, or carriage return.
 *
 * @param context - The lexer context to read from.
 * @returns The whitespace string, or null if no valid whitespace is found.
 */
export function readWhitespaces(
    context: LexerContext,
): string | null
{
    let whitespace = "";

    while (context.index < context.length)
    {
        const character = context.current();
        if (!character)
        {
            break;
        }

        if (
            isWhitespace(character) // Check if the character is a whitespace
        )
        {
            whitespace += character;
            context.advance(1);
        }
        else
        {
            // Invalid character for whitespace, break out of the loop
            break;
        }
    }

    return whitespace.length > 0 ? whitespace : null;
}