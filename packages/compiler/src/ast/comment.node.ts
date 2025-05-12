import { BaseNode } from "./base.node";

export interface CommentNode extends BaseNode<"comment">
{
    comment: string;
};