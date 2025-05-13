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
import { readHtmlIdentifier } from "../utils/html";
import { readBooleanLiteral, readNumberLiteral, readStringLiteral } from "../utils/literals";
import { readWhitespaces } from "../utils/read-whitespaces";

/* Special tokens we should recognize */
const tokens: Record<string, TokenKind> = {
    "<": TokenKind.HtmlTagStart,
    ">": TokenKind.HtmlTagEnd,
    "=": TokenKind.Equals,

    "!": TokenKind.Bang,
    "?": TokenKind.QuestionMark,
    ":": TokenKind.Colon,
    ";": TokenKind.Semicolon,
    ",": TokenKind.Comma,
    ".": TokenKind.Dot,
    "+": TokenKind.Plus,
    "-": TokenKind.Minus,
    "/": TokenKind.Slash,
    "{": TokenKind.CurlyBraceStart,
    "}": TokenKind.CurlyBraceEnd,
    "(": TokenKind.ParenthesisStart,
    ")": TokenKind.ParenthesisEnd,
    "[": TokenKind.SquareBracketStart,
    "]": TokenKind.SquareBracketEnd,
    "@": TokenKind.AtSign,
    "&": TokenKind.Ampersand,

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
export function htmlTagMode(
    context: LexerContext,
): Token | null
{
    // Implement the logic for the default lexer mode
    // This could involve reading identifiers, keywords, literals, etc.
    const start = context.index;

    let whitespace = readWhitespaces(context);
    if (whitespace)
    {
        return context.token(TokenKind.Whitespace, { whitespace }, context.index - start);
    }

    let char = context.current();
    if (!char)
    {
        return null;
    }

    const tokenKind = tokens[char];
    if (tokenKind)
    {
        let token = context.token(tokenKind, {}, context.index - start);
        context.advance(1);
        return token;
    }

    let identifier = readHtmlIdentifier(context);
    if (identifier)
    {
        return context.token(TokenKind.Identifier, { identifier }, context.index - start);
    }

    let stringLiteral = readStringLiteral(context);
    if (stringLiteral)
    {
        return context.token(TokenKind.StringLiteral, { string: stringLiteral }, context.index - start);
    }

    let numberLiteral = readNumberLiteral(context);
    if (numberLiteral)
    {
        return context.token(TokenKind.NumberLiteral, { number: numberLiteral }, context.index - start);
    }

    let booleanLiteral = readBooleanLiteral(context);
    if (booleanLiteral !== null)
    {
        return context.token(TokenKind.BooleanLiteral, { boolean: booleanLiteral }, context.index - start);
    }

    throw context.error(`Unexpected character '${context.current()}'`);

}