/**
 * Escapes whitespace characters in a string by replacing them with their
 * visible escape sequence representations. This is useful for displaying
 * strings in logs or error messages where invisible whitespace should be shown.
 *
 * @param str - The input string to escape.
 * @returns The escaped string with whitespace characters replaced.
 *
 * @example
 * escapeWhitespace("Hello\nWorld\t!"); // Returns 'Hello\\nWorld\\t!'
 */
export function escapeWhitespace(str: string): string
{
    return str.replace(/\t/g, "\\t")
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\f/g, "\\f")
        .replace(/\v/g, "\\v");
}