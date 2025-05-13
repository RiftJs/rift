import { SourcePosition } from "../utils/source-position";
import { RiftDebugNode } from "./debug.node";
import { RiftHtmlCommentNode } from "./html/html-comment.node";
import { RiftHtmlElementNode } from "./html/html-element.node";
import { RiftHtmlscriptNode } from "./html/html-script.node";
import { RiftHtmlTextNode } from "./html/html-text.node";
import { RiftModuleNode } from "./module.node";

export type RiftHtmlNodes = RiftHtmlTextNode | RiftHtmlElementNode | RiftHtmlCommentNode | RiftHtmlscriptNode;
export type RiftNode = RiftDebugNode | RiftModuleNode | RiftHtmlNodes;


export type RiftNodeKind = RiftNode["kind"];
export type RiftNodeType<T extends RiftNodeKind> = Extract<RiftNode, { kind: T }>;

type RiftNodeData<K extends RiftNodeKind> = Omit<RiftNodeType<K>, "kind"
    | "children"
    | "position"
    | "parent"
    | "addChild"
    | "removeChild"
    | "addToParent"
    | "removeFromParent"
>;// & Partial<Pick<RiftNodeType<K>, "children">>;

export function createNode<K extends RiftNodeKind>(kind: K, position: SourcePosition, data: RiftNodeData<K>): RiftNodeType<K>
{
    return {
        ...data,
        kind: kind,
        position: position,
        parent: null,
        children: [],
        addChild(this: RiftNodeType<K>, child: RiftNode): void
        {
            if (child.parent)
            {
                child.parent.removeChild(child);
            }

            child.parent = this;
            this.children.push(child);
        },
        addToParent(this: RiftNodeType<K>, parent: RiftNode): void
        {
            this.removeFromParent();
            this.parent = parent;
            parent.addChild(this);
        },
        removeChild(this: RiftNodeType<K>, child: RiftNode): void
        {
            const index = this.children.indexOf(child);
            if (index !== -1)
            {
                child.parent = null;
                this.children.splice(index, 1);
            }
        },
        removeFromParent(this: RiftNodeType<K>): void
        {
            if (this.parent)
            {
                this.parent.removeChild(this);
                this.parent = null;
            }
        },

    } as unknown as RiftNodeType<K>;
}
