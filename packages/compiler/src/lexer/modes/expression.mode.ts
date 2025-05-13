import { LexerContext } from "../context";
import { Token, TokenKind } from "../tokens";
import { readBooleanLiteral, readNumberLiteral, readStringLiteral, readStringTemplateLiteral } from "../utils/literals";
import { readIdentifier } from "../utils/read-identifier";
import { readWhitespaces } from "../utils/read-whitespaces";

// Matter mode is simply parsing Typescript between --- <content> --- tags
const singleTokens: Record<string, TokenKind> = {
    // Operators
    "@": TokenKind.AtSign,
    "#": TokenKind.Hash,
    "$": TokenKind.Dollar,
    "+": TokenKind.Plus,
    "-": TokenKind.Minus,
    "*": TokenKind.Star,
    "/": TokenKind.Slash,
    "%": TokenKind.Percent,
    "^": TokenKind.Caret,
    "&": TokenKind.Ampersand,
    "|": TokenKind.Pipe,
    "!": TokenKind.Bang,
    "=": TokenKind.Equals,
    "<": TokenKind.LessThan,
    ">": TokenKind.GreaterThan,
};

const complexTokens: Record<string, TokenKind> = {
    "==": TokenKind.Equals,
    "===": TokenKind.Equals,
    "!=": TokenKind.Bang,
    "!==": TokenKind.Bang,
    "<=": TokenKind.LessThan,
    ">=": TokenKind.GreaterThan,
};

const keywords: Record<string, TokenKind> = {
    "if": TokenKind.Identifier,
    "else": TokenKind.Identifier,
    "for": TokenKind.Identifier,
    "while": TokenKind.Identifier,
    "return": TokenKind.Identifier,
    "switch": TokenKind.Identifier,
    "case": TokenKind.Identifier,
    "break": TokenKind.Identifier,
    "continue": TokenKind.Identifier,
    "default": TokenKind.Identifier,
    "function": TokenKind.Identifier,
    "class": TokenKind.Identifier,
    "let": TokenKind.Identifier,
};

// Parse Rift expressions
export function expressionMode(
    context: LexerContext,
): Token | null
{

    let whitespace = readWhitespaces(context);
    if (whitespace)
    {
        return context.token(TokenKind.Whitespace, { whitespace });
    }

    let identifier = readIdentifier(context);
    if (identifier)
    {
        return context.token(TokenKind.Identifier, { identifier });
    }

    // literals
    let stringLiteral = readStringLiteral(context);
    if (stringLiteral)
    {
        return context.token(TokenKind.StringLiteral, { string: stringLiteral });
    }

    let numberLiteral = readNumberLiteral(context);
    if (numberLiteral)
    {
        return context.token(TokenKind.NumberLiteral, { number: numberLiteral });
    }

    let templateLiteral = readStringTemplateLiteral(context);
    if (templateLiteral)
    {
        return context.token(TokenKind.TemplateLiteral, { string: templateLiteral });
    }

    let booleanLiteral = readBooleanLiteral(context);
    if (booleanLiteral)
    {
        return context.token(TokenKind.BooleanLiteral, { boolean: booleanLiteral });
    }

    let character = context.current();
    if (!character)
    {
        return null;
    }

    let nextCharacter = context.peek(1);
    if (nextCharacter)
    {
        let tokenKind = complexTokens[character + nextCharacter];
        if (tokenKind)
        {
            context.advance(2);
            return context.token(tokenKind);
        }
    }

    let singleToken = singleTokens[character];
    if (singleToken)
    {
        context.advance(1);
        return context.token(singleToken);
    }

    throw context.error(`Unexpected character '${context.current()}'`);
}