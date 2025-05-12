import { VDOMNode } from "./node";

export class VDOMTextNode extends VDOMNode
{
    public constructor(
        public text: string,
    )
    {
        super();
    }

    toHTML(indent: number): string
    {
       return this.text;
    }
};