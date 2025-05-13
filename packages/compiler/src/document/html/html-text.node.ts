import { RiftBaseNode } from "../base.node";

export interface RiftHtmlTextNode extends RiftBaseNode<"html-text">
{
    content: string;
};
