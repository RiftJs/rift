import { RiftBaseNode } from "../base.node";

/**
 * Represents an attribute on an HTML element node.
 */
export interface RiftHtmlElementAttribute
{
    name: string;
    value?: string;
};

/**
 * The direction of a binding on an HTML element: 'in', 'out', or 'in-out'.
 */
export type RiftHtmlElementBindingDirection = "in" | "out" | "in-out";

/**
 * Represents a binding on an HTML element node.
 */
export interface RiftHtmlElementBinding
{
    name: string;
    expression: string;
    direction: RiftHtmlElementBindingDirection;
};

/**
 * Represents a directive on an HTML element node.
 */
export interface RiftHtmlElementDirective
{
    name: string;
    expression?: string;
}

/**
 * Represents an HTML element node in the AST, including its name, attributes, bindings, and directives.
 */
export interface RiftHtmlElementNode extends RiftBaseNode<"html-element">
{
    name: string;
    attributes: RiftHtmlElementAttribute[];
    bindings: RiftHtmlElementBinding[];
    directives: RiftHtmlElementDirective[];
};
