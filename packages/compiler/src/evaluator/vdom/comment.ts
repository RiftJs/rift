import { HTMLGeneratorSettings } from "./document";
import { VDOMNode } from "./node";

export class VDOMCommentNode extends VDOMNode
{
    constructor(
        public comment: string,
    )
    {
        super();
    }


    toHTML(indent: number = 0, settings?: HTMLGeneratorSettings): string
    {
        return " ".repeat(indent * (settings?.indent ?? 0)) + `<!--${this.comment}-->`;
    }
};