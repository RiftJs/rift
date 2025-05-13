import { Token } from "../lexer/tokens";

export function inspectToken(token: Token | null): string
{
    if (!token)
    {
        return "Token(null)";
    }

    const extra = Object.entries(token)
        .filter(([k]) => k !== "kind" && k !== "position")
        .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
        .join(", ");

    return `Token(${token.kind}, ${extra})`;
}

export function debugInspectToken(token: Token | null): string
{
    if (!token)
    {
        return "Token(null)";
    }


    let tokenInformation = `Token(${token.kind}, position=${token.position.line}:${token.position.column}, `;
    const extra = Object.entries(token)
        .filter(([k]) => k !== "kind" && k !== "position")
        .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
        .join(", ");

    return `${tokenInformation}${extra})`;
}