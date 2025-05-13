import { RiftBaseNode } from "../base.node";

export interface RiftHtmlElementAttribute
{
    name: string;
    value?: string;
};

export type RiftHtmlElementBindingDirection = "in" | "out" | "in-out";
export interface RiftHtmlElementBinding
{
    name: string;
    expression: string;
    direction: RiftHtmlElementBindingDirection;
};

export interface RiftHtmlElementDirective
{
    name: string;
    expression?: string;
}

export interface RiftHtmlElementNode extends RiftBaseNode<"html-element">
{
    name: string;
    attributes: RiftHtmlElementAttribute[];
    bindings: RiftHtmlElementBinding[];
    directives: RiftHtmlElementDirective[];
};
