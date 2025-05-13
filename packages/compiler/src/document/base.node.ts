import { SourcePosition } from "../utils/source-position";
import { RiftNode } from "./node";

/**
 * Base interface for all AST nodes in Rift, parameterized by node kind.
 * Includes parent/child relationships and source position.
 */
export interface RiftBaseNode<Kind extends string>
{
    kind: Kind;
    parent: RiftNode | null;
    children: RiftNode[];
    position: SourcePosition;

    /** Adds a child node. */
    addChild(child: RiftNode): void;
    /** Removes a child node. */
    removeChild(child: RiftNode): void;
    /** Adds this node to a parent node. */
    addToParent(parent: RiftNode): void;
    /** Removes this node from its parent. */
    removeFromParent(): void;
};