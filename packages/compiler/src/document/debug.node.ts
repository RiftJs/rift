import { RiftBaseNode } from "./base.node";


/**
 * Represents a debug node in the Rift document structure, used for debugging or logging during parsing.
 */
export interface RiftDebugNode extends RiftBaseNode<"debug">
{
    value: string;
};
