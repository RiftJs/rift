import { RiftNode } from "../ast/node";
import { TokenPosition } from "../lexer/tokens";

export class EvaluationError extends Error
{
    constructor(message: string, public node: RiftNode)
    {
        super(message);
        this.name = "EvaluationError";
    }

    public get position(): TokenPosition
    {
        return this.node.position;
    }
};