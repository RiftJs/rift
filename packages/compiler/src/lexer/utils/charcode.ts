// Character check: is the character an uppercase or lowercase English letter?
export function isAlpha(ch: string): boolean
{
    return (ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z');
}

// Character check: is the character a digit or a letter?
export function isAlphaNumeric(ch: string): boolean
{
    return (ch >= '0' && ch <= '9') || (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z');
}

// Character check: is the character a digit?
export function isDigit(ch: string): boolean
{
    return (ch >= '0' && ch <= '9');
}

// Character check: is the character a hexadecimal digit?
export function isHexDigit(ch: string): boolean
{
    return (ch >= '0' && ch <= '9') || (ch >= 'A' && ch <= 'F') || (ch >= 'a' && ch <= 'f');
}

// Character check: is the character an octal digit?
export function isOctalDigit(ch: string): boolean
{
    return (ch >= '0' && ch <= '7');
}

// Character check: is the character a binary digit?
export function isBinaryDigit(ch: string): boolean
{
    return ch === '0' || ch === '1';
}

// Character check: is the character whitespace?
export function isWhitespace(ch: string): boolean
{
    return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r';
}

// Character check: is the character a line terminator?
export function isLineTerminator(ch: string): boolean
{
    return ch === '\n' || ch === '\r';
}

// Character check: is the character a quote?
export function isQuote(ch: string): boolean
{
    return ch === '"' || ch === "'";
}

// Character check: is the character a backtick?
export function isBackTick(ch: string): boolean
{
    return ch === '`';
}


export function isAlphaUTF8(ch: string): boolean
{
    return /^[\p{L}]$/u.test(ch);
}

export function isAlphaNumericUTF8(ch: string): boolean
{
    return /^[\p{L}\p{N}]$/u.test(ch);
}