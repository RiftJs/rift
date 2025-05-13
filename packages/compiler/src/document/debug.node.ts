import { RiftBaseNode } from "./base.node";


/*
* RiftDebugNode
*
* Represents a debug node in the Rift document structure. Used for
* debugging purposes, such as logging or displaying information during parsing.
*/
export interface RiftDebugNode extends RiftBaseNode<"debug">
{
    value: string;
};
