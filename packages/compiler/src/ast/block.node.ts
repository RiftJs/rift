import { BaseNode } from "./base.node";
import { RiftNode } from "./node";

export interface BlockNode extends BaseNode<"block">
{
    for: RiftNode | null;
};