import { BaseNode } from "./base.node";

export interface ElementAttribute
{
    name: string;
    value?: string;
};

export type ElementBindingDirection = "in" | "out" | "in-out";
export interface ElementBinding
{
    name: string;
    expression: string;
    direction: ElementBindingDirection;
};

export interface ElementDirective
{
    name: string;
    expression?: string;
}

export interface ElementNode extends BaseNode<"element"> 
{
    name: string;
    attributes: ElementAttribute[];
    bindings: ElementBinding[];
    directives: ElementDirective[];
    selfClosing: boolean;
};