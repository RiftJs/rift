import { BaseNode } from "./base.node";

// Currently this is not supported in the parser, DOCTYPE tags are ignored
export interface DocumentDeclaration
{
    name: string;
    attributes: string[];
    elements: string[];
    value: string;
};

export interface RiftDocumentNode extends BaseNode<"document">
{
    declarations: DocumentDeclaration[];
};