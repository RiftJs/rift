import { RiftBaseNode } from "../base.node";

/**
 * Represents a <script> node in HTML, containing the script content.
 */
export interface RiftHtmlscriptNode extends RiftBaseNode<"html-script">
{
    content: string;
};
