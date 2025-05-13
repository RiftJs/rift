import { SourcePosition } from "../utils/source-position";

export enum TokenKind
{
    Whitespace = "Whitespace", // Whitespaces
    Identifier = "Identifier", // word

    // Literals
    StringLiteral = "StringLiteral", // String literal
    TemplateLiteral = "TemplateLiteral", // Template literal
    NumberLiteral = "NumberLiteral", // Number literal
    BooleanLiteral = "BooleanLiteral", // Boolean literal

    // Html tokens
    HtmlText = "HtmlText", // Text between tags
    HtmlComment = "HtmlComment", // <!-- comment -->
    HtmlEntity = "HtmlEntity", // &nbsp; or &#x20;

    HtmlTagStart = "HtmlTagStart", // <
    HtmlTagEnd = "HtmlTagEnd", // >

    // script tokens
    ScriptCode = "ScriptCode", // Javascript code between <script> tags

    // Matter tokens
    MatterContent = "MatterContent", // Content between --- tags

    // CSS tokens
    CssDimension = "CssDimension", // 10px, 20em, etc.
    CssColorHex = "CssColorHex", // #ff0000, #00ff00, etc.
    CssComment = "CssComment", // /* comment */
    CssMatchChild = "CssMatchChild", // >

    // Operators
    QuestionMark = "QuestionMark", // ?
    Bang = "Bang", // !
    Colon = "Colon", // :
    Semicolon = "Semicolon", // ;
    Comma = "Comma", // ,
    Dot = "Dot", // .
    Plus = "Plus", // +
    Minus = "Minus", // -
    Slash = "Slash", // /
    Percent = "Percent", // %
    Equals = "Equals", // =
    AtSign = "AtSign", // @
    Ampersand = "Ampersand", // &
    Pipe = "Pipe", // |
    Tilde = "Tilde", // ~
    Caret = "Caret", // ^
    Dollar = "Dollar", // $
    Star = "Star", // *
    Hash = "Hash", // #
    LessThan = "LessThan", // <
    GreaterThan = "GreaterThan", // >

    // Brackets
    CurlyBraceStart = "CurlyBraceStart", // {
    CurlyBraceEnd = "CurlyBraceEnd", // }

    ParenthesisStart = "ParenthesisStart", // (
    ParenthesisEnd = "ParenthesisEnd", // )

    SquareBracketStart = "SquareBracketStart", // [
    SquareBracketEnd = "SquareBracketEnd", // ]

    TemplateInterpolationStart = "TemplateInterpolationStart", // {{
    TemplateInterpolationEnd = "TemplateInterpolationEnd", // }}

};


interface BaseToken<Kind extends TokenKind>
{
    kind: Kind;
    position: SourcePosition;
};

export interface WhitespaceToken extends BaseToken<TokenKind.Whitespace>
{
    whitespace: string;
};


/*
* Html tokens
*/


export interface HtmlTextToken extends BaseToken<TokenKind.HtmlText>
{
    text: string;
};

export interface HtmlCommentToken extends BaseToken<TokenKind.HtmlComment>
{
    comment: string;
};

export interface HtmlEntityToken extends BaseToken<TokenKind.HtmlEntity>
{
    entity: string;
};

export interface HtmlIdentifierToken extends BaseToken<TokenKind.Identifier>
{
    identifier: string;
};

/*
* Css Tokens
*/
export interface CssDimensionToken extends BaseToken<TokenKind.CssDimension>
{
    value: number;
    unit: string;
};

export interface CssColorHexToken extends BaseToken<TokenKind.CssColorHex>
{
    colorHex: string;
};

export interface CssCommentToken extends BaseToken<TokenKind.CssComment>
{
    comment: string;
};

/*
* Javascript tokens
*/
export interface ScriptCodeToken extends BaseToken<TokenKind.ScriptCode>
{
    code: string;
};

/*
* Matter tokens
*/
export interface MatterContentToken extends BaseToken<TokenKind.MatterContent>
{
    content: string;
};

/*
* Literal tokens
*/
export interface StringLiteralToken extends BaseToken<TokenKind.StringLiteral>
{
    string: string;
};

export interface TemplateLiteralToken extends BaseToken<TokenKind.TemplateLiteral>
{
    string: string;
};

export interface NumberLiteralToken extends BaseToken<TokenKind.NumberLiteral>
{
    number: number;
};

export interface BooleanLiteralToken extends BaseToken<TokenKind.BooleanLiteral>
{
    boolean: boolean;
};


export type TokenKindOf = Token["kind"];

export type HtmlTokens = HtmlTextToken | HtmlCommentToken | HtmlEntityToken | HtmlIdentifierToken;
export type LiteralTokens = StringLiteralToken | TemplateLiteralToken | NumberLiteralToken | BooleanLiteralToken;
export type WhitespaceTokens = WhitespaceToken;
export type CssTokens = CssDimensionToken | CssColorHexToken | CssCommentToken;
export type ScriptTokens = ScriptCodeToken;

export type ExplicitTokens = WhitespaceToken | HtmlTokens | CssTokens | ScriptTokens | LiteralTokens | MatterContentToken;

export type ExplicitTokenTypes = ExplicitTokens['kind'];

export type CommonTokenTypes = Exclude<TokenKind, ExplicitTokenTypes>;
export type CommonTokens = BaseToken<CommonTokenTypes>;

export type Token = ExplicitTokens | CommonTokens;
export type TokenOfKind<K extends TokenKindOf> = K extends Token["kind"] ? Extract<Token, { kind: K }> : never;
