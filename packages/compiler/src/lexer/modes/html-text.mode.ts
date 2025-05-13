/**
 * Default lexer mode for the HTML parser.
 *
 * This module defines the main tokenization logic for HTML and template files. It handles:
 *   - Whitespace and entity recognition
 *   - Tag and bracket delimiters
 *   - Special tokens like DOCTYPE and HTML entities
 *   - Text content extraction
 *   - Error handling for unexpected characters
 *
 * The exported function `defaultLexerMode` is the entry point for this mode, and is called by the lexer
 * to produce the next token from the input stream.
 *
 * @module lexer/modes/normal.mode
 */

import { LexerContext } from "../context";
import { Token, TokenKind } from "../tokens";
import { readHtmlEntity, readHtmlText } from "../utils/html";
import { readMatterStartTag } from "../utils/matter";
import { readWhitespaces } from "../utils/read-whitespaces";

/* Special tokens we should recognize */
const tokens: Record<string, TokenKind> = {
    "<": TokenKind.HtmlTagStart,
    ">": TokenKind.HtmlTagEnd,

    // "(": TokenKind.ParenthesisStart,
    // ")": TokenKind.ParenthesisEnd,
    // "{": TokenKind.CurlyBraceStart,
    // "}": TokenKind.CurlyBraceEnd,
    // "[": TokenKind.SquareBracketStart,
    // "]": TokenKind.SquareBracketEnd,
    //"@": TokenKind.AtSign,
};

/**
 * The main lexer mode for HTML parsing.
 *
 * This function reads the next token from the input stream using the provided context.
 * It recognizes whitespace, tag delimiters, brackets, at-signs, DOCTYPE, HTML entities, and text.
 * If an unexpected character is encountered, it throws a lexer error.
 *
 * @param context - The current lexer context.
 * @returns The next Token, or null if the end of input is reached.
 */
export function htmlTextMode(
    context: LexerContext,
): Token | null
{


    let whitespace = readWhitespaces(context);
    if (whitespace)
    {
        return context.token(TokenKind.Whitespace, { whitespace });
    }

    let char = context.current();
    if (!char)
    {
        return null;
    }

    const tokenKind = tokens[char];

    if (tokenKind)
    {
        let token = context.token(tokenKind);
        context.advance(1);

        return token;
    }

    let entity = readHtmlEntity(context);
    if (entity)
    {
        return context.token(TokenKind.HtmlEntity, { entity });
    }

    let text = readHtmlText(context);
    if (text)
    {
        return context.token(TokenKind.HtmlText, { text });
    }

    throw context.error(`Unexpected character '${context.current()}'`);

}