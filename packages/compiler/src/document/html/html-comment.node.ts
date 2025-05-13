import { RiftBaseNode } from "../base.node";

export interface RiftHtmlCommentNode extends RiftBaseNode<"html-comment">
{
    comment: string;
};
