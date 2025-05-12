import { BaseNode } from "./base.node";

export interface TextNode extends BaseNode<"text">
{
    text: string;
};