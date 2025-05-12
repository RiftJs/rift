export enum TokenType
{
    Text = "TEXT",

    HtmlDeclaration = "HTML_DECLARATION", // <!DOCTYPE html>
    // XmlDeclarationEnd = "XML_DECLARATION", // <?xml version="1.0" encoding="UTF-8"?>

    OpenTag = "OPEN_TAG", // <
    CloseTag = "CLOSE_TAG", // >
    SelfCloseTag = "SELF_CLOSE_TAG", // />
    Slash = "SLASH", // /


    HtmlComment = "HTML_COMMENT", // <!-- comment -->

    Identifier = "IDENTIFIER", // a-zA-Z
    Number = "NUMBER", // 0-9
    String = "STRING", // "string" or 'string'

    // Brackets
    OpenBracket = "OPEN_BRACKET", // [
    CloseBracket = "CLOSE_BRACKET", // ]
    OpenParenthesis = "OPEN_PARENTHESES", // (
    CloseParenthesis = "CLOSE_PARENTHESES", // )
    OpenCurlyBracket = "OPEN_CURLY_BRACKET", // {
    CloseCurlyBracket = "CLOSE_CURLY_BRACKET", // }

    // Punctuation
    Comma = "COMMA", // ,
    Semicolon = "SEMICOLON", // ;
    Colon = "COLON", // :
    Dot = "DOT", // .
    QuestionMark = "QUESTION_MARK", // ?
    ExclamationMark = "EXCLAMATION_MARK", // !


    // Operators
    Plus = "PLUS",
    Minus = "MINUS",
    Multiply = "MULTIPLY",
    Divide = "DIVIDE",
    Modulus = "MODULUS",
    Equals = "EQUALS",
    NotEquals = "NOT_EQUALS",
    GreaterThan = "GREATER_THAN",
    LessThan = "LESS_THAN",
    GreaterThanOrEquals = "GREATER_THAN_OR_EQUALS",
    LessThanOrEquals = "LESS_THAN_OR_EQUALS",
    LogicalAnd = "LOGICAL_AND",
    LogicalOr = "LOGICAL_OR",
    LogicalNot = "LOGICAL_NOT",
    BitwiseAnd = "BITWISE_AND",
    BitwiseOr = "BITWISE_OR",
    BitwiseXor = "BITWISE_XOR",
    BitwiseNot = "BITWISE_NOT",
    ShiftLeft = "SHIFT_LEFT",
    ShiftRight = "SHIFT_RIGHT",

    Statement = "STATEMENT", // @for()
};

export interface TokenPosition
{
    line: number;
    column: number;
    offset: number;
};

interface BaseToken<Kind extends TokenType>
{
    kind: Kind;
    position: TokenPosition;
};


export interface TextToken extends BaseToken<TokenType.Text>
{
    text: string;
};

export interface IdentifierToken extends BaseToken<TokenType.Identifier>
{
    name: string;
};

// Number Token
export interface NumberToken extends BaseToken<TokenType.Number>
{
    value: number;
};

// String Token
export interface TokenString extends BaseToken<TokenType.String>
{
    value: string;
};

export interface HtmlCommentToken extends BaseToken<TokenType.HtmlComment>
{
    comment: string;
};

export interface DeclarationToken extends BaseToken<TokenType.HtmlDeclaration>
{
    declaration: string;
}

export interface StatementToken extends BaseToken<TokenType.Statement>
{
    identifier: string;
};

export type TokenKind = Token["kind"];

export type ExplicitTokens = TextToken | IdentifierToken | NumberToken | TokenString | HtmlCommentToken | DeclarationToken | StatementToken;
export type ExplicitTokenTypes = ExplicitTokens['kind'];

export type CommonTokenTypes = Exclude<TokenType, ExplicitTokenTypes>;
export type CommonTokens = BaseToken<CommonTokenTypes>;

export type Token = ExplicitTokens | CommonTokens;