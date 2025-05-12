import { BaseNode } from "./base.node";
import { BlockNode } from "./block.node";

export interface ForeachStatementNode extends BaseNode<"foreach-statement">
{
    collection: string;
    alias: string;
    index: string;
    block: BlockNode | null;
};