import { TokenPosition } from "../lexer/tokens";

export class ParserError extends Error
{
    constructor(message: string, public position: TokenPosition)
    {
        super(message);
        this.name = "ParserError";
    }
}
