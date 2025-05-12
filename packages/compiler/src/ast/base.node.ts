import { TokenPosition } from "../lexer/tokens";
import { RiftNode } from "./node";

export interface BaseNode<Kind extends string>
{
    kind: Kind;
    parent?: RiftNode;
    children: RiftNode[];
    position: TokenPosition;
};

