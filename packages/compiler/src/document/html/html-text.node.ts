import { RiftBaseNode } from "../base.node";

/**
 * Represents a text node in HTML, containing the raw text content.
 */
export interface RiftHtmlTextNode extends RiftBaseNode<"html-text">
{
    content: string;
};
