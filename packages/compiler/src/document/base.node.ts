import { SourcePosition } from "../utils/source-position";
import { RiftNode } from "./node";

export interface RiftBaseNode<Kind extends string>
{
    kind: Kind;
    parent: RiftNode | null;
    children: RiftNode[];
    position: SourcePosition;

    addChild(child: RiftNode): void;
    removeChild(child: RiftNode): void;
    addToParent(parent: RiftNode): void;
    removeFromParent(): void;
};