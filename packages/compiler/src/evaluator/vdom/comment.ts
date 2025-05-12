import { VDOMNode } from "./node";

export class VDOMCommentNode extends VDOMNode
{
    constructor(
        public comment: string,
    )
    {
        super();
    }


    toHTML(): string
    {
        return `<!--${this.comment}-->`;
    }
};