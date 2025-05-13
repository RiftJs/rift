import { LexerContext } from "../context";
import { isAlphaNumericUTF8, isAlphaUTF8, isWhitespace } from "./charcode";

/**
 * Reads HTML text from the current context.
 * HTML text is a sequence of characters that can include letters, digits, and some symbols.
 * 
 * @param context - The lexer context to read from.
 * @description Reads HTML text from the current context.
 * @returns The HTML text string, or null if no valid text is found.
 * @example
 * const context = new LexerContext("<div>Hello World</div>");
 * const text = readHtmlText(context);
 * console.log(text); // Output: "Hello World"
 */
export function readHtmlText(
    context: LexerContext,
): string | null
{
    let text = "";

    while (context.index < context.length)
    {
        const character = context.current();
        if (!character)
        {
            break;
        }

        // Stop characters for HTML text, we need to emit a token for these
        if (
            isWhitespace(character) // Check if the character is a whitespace
            || character === "<" // less than (<)
            || character === ">" // greater than (>)
            || character === "{" // left brace ({)
            || character === "}" // right brace (})
            || character === "@" // at sign (@) -> directive start
            || character === "&" // & -> entity start
        )
        {
            break;
        }

        text += character;
        context.advance(1);
    }

    return text.length > 0 ? text : null;
}

const htmlEntityRegex = /[a-zA-Z0-9#]+/;

/**
 * Reads an HTML entity from the current context.
 * An HTML entity starts with '&', contains alphanumeric characters or '#', and ends with ';'.
 * Throws an error if the entity is not properly terminated.
 *
 * @param context - The lexer context to read from.
 * @returns The HTML entity string, or null if no valid entity is found.
 * @throws If the entity does not end with a semicolon.
 * @example
 * const context = new LexerContext('&amp;');
 * const entity = readHtmlEntity(context);
 * console.log(entity); // Output: '&amp;'
 */
export function readHtmlEntity(
    context: LexerContext,
): string | null
{
    let entity = "";

    let char = context.current();
    if (char !== "&")
    {
        return null;
    }

    entity += char;
    context.advance(1);

    while (char.match(htmlEntityRegex))
    {
        char = context.current();
        if (!char)
        {
            break;
        }

        if (char === ";")
        {
            entity += char;
            context.advance(1);
            break;
        }

        entity += char;
        context.advance(1);
    }

    if (!entity.endsWith(";"))
    {
        throw context.error(`Invalid HTML entity '${entity}' expected ';'`, context.position(-entity.length, entity.length));
    }

    return entity.length > 0 ? entity : null;
}


const VALID_DOCTYPE_NAMES = new Set([
    "html",
    "svg",
    "math",
]);

/**
 * Reads an identifier from the current context.
 * An identifier is a sequence of characters that starts with a letter or underscore,
 * followed by letters, digits, or underscores.
 *
 * @param context - The lexer context to read from.
 * @returns The identifier string, or null if no valid identifier is found.
 */
export function readHtmlIdentifier(
    context: LexerContext,
): string | null
{
    let identifier = "";

    let startCharacter = context.current() || "";
    if (!isAlphaUTF8(startCharacter) && startCharacter !== "_")
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
            || character === ":" // colon (:)
            || character === "." // dot (.)
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