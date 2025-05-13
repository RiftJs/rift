import { SourcePosition } from "../utils/source-position";

export class CompilerError extends Error
{
    constructor(name: string, message: string, public position: SourcePosition)
    {
        super(message);

        this.name = name;
    }
}
