import { VDOMNode } from "./node";

export interface VDOMAttribute
{
    name: string;
    value?: string;
};

export class VDOMElementNode extends VDOMNode
{
    public constructor(
        public name: string,
        public attributes: VDOMAttribute[] = [],
    )
    {
        super();
    }

    toHTML(indent: number): string
    {
        let result = " ".repeat(indent) + `<${this.name}`;
        for (let attribute of this.attributes)
        {
            if (attribute.value)
            {
                result += ` ${attribute.name}="${attribute.value}"`;
            }
            else
            {
                result += ` ${attribute.name}`;
            }
        }
        result += ">";
        for (let child of this.children)
        {
            result += child.toHTML(indent + 2);
        }
        result += `</${this.name}>`;
        return result;
    }
};