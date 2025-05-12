import { TokenPosition } from "./tokens";

export class LexerError extends Error
{
    constructor(message: string, public position: TokenPosition)
    {
        super(message);
        
        this.name = "RiftLexerError";
    }
}
