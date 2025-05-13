import { LexerContext } from "../context";
import { Token, TokenKind } from "../tokens";
import { readCSSIdentifier, readCSSDimension, readCSSColorHexadecimal, readCSSComment } from "../utils/css";
import { readHtmlIdentifier } from "../utils/html";
import { readBooleanLiteral, readNumberLiteral, readStringLiteral } from "../utils/literals";
import { readWhitespaces } from "../utils/read-whitespaces";

/* Special tokens we should recognize */
const tokens: Record<string, TokenKind> = {
    "<": TokenKind.LessThan,
    ">": TokenKind.GreaterThan,
    ".": TokenKind.Dot,
    "#": TokenKind.Hash,
    ":": TokenKind.Colon,
    ";": TokenKind.Semicolon,
    ",": TokenKind.Comma,
    "{": TokenKind.CurlyBraceStart,
    "}": TokenKind.CurlyBraceEnd,
    "(": TokenKind.ParenthesisStart,
    ")": TokenKind.ParenthesisEnd,
    "[": TokenKind.SquareBracketStart,
    "]": TokenKind.SquareBracketEnd,
    "+": TokenKind.Plus,
    "~": TokenKind.Tilde,
    "|": TokenKind.Pipe,
    "^": TokenKind.Caret,
    "$": TokenKind.Dollar,
    "*": TokenKind.Star,
    "/": TokenKind.Slash,
    "=": TokenKind.Equals,
    "!": TokenKind.Bang,
};

export function cssMode(
    context: LexerContext,
): Token | null
{
    // Implement the logic for the default lexer mode
    // This could involve reading identifiers, keywords, literals, etc.
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

    let comment = readCSSComment(context);
    if (comment)
    {
        return context.token(TokenKind.CssComment, { comment });
    }

    let dimension = readCSSDimension(context);
    if (dimension)
    {
        return context.token(TokenKind.CssDimension, { ...dimension });
    }

    let number = readNumberLiteral(context);
    if (number !== null)
    {
        return context.token(TokenKind.NumberLiteral, { number });
    }

    let identifier = readCSSIdentifier(context);
    if (identifier)
    {
        return context.token(TokenKind.Identifier, { identifier });
    }

    let string = readStringLiteral(context);
    if (string)
    {
        return context.token(TokenKind.StringLiteral, { string });
    }

    let colorHex = readCSSColorHexadecimal(context);
    if (colorHex)
    {
        return context.token(TokenKind.CssColorHex, { colorHex });
    }

    const tokenKind = tokens[char];
    if (tokenKind)
    {
        let token = context.token(tokenKind);
        context.advance(1);
        return token;
    }

    throw context.error(`Unexpected character '${context.current()}'`);
}