import { RiftBaseNode } from "../base.node";

/**
 * Represents an HTML comment node, containing the comment string.
 */
export interface RiftHtmlCommentNode extends RiftBaseNode<"html-comment">
{
    comment: string;
};
