import { TokenPosition } from "../lexer/tokens";
import { BlockNode } from "./block.node";
import { CommentNode } from "./comment.node";
import { RiftDocumentNode } from "./document.node";
import { ElementNode } from "./element.node";
import { ForeachStatementNode } from "./foreach-statement.node";
import { TextNode } from "./text.node";

export type RiftNode = RiftDocumentNode | ElementNode | TextNode | CommentNode | BlockNode | ForeachStatementNode;

export type NodeKind = RiftNode["kind"];
export type NodeType<T extends NodeKind> = Extract<RiftNode, { kind: T }>;
export type NodeTypes = NodeType<NodeKind>[];


export type NodeDataMinimal<K extends NodeKind> = Omit<NodeType<K>, "kind" | "children" | "position" | "parent"> & Partial<Pick<NodeType<K>, "children" | "parent">>;

export function node<K extends NodeKind>(kind: K, position: TokenPosition, data: NodeDataMinimal<K>): NodeType<K>
{
    return {
        ...data,
        kind: kind,
        position: position,
        parent: data.parent ?? undefined,
        children: data.children ?? [],
    } as NodeType<K>;
}
