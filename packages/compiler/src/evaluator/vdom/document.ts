import { VDOMNode } from "./node";

export class VDOMDocument
{
    constructor(
        public doctype?: string,
        public children: VDOMNode[] = [],
    )
    {
    }


    toHTML(): string
    {
        let head = "<!DOCTYPE html>";
        if (this.doctype)
        {
            head = `<!DOCTYPE ${this.doctype}>`;
        }

        return head + this.children.map(child => child.toHTML(0)).join("");
    }
};