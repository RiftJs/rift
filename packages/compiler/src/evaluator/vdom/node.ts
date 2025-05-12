import { HTMLGeneratorSettings } from "./document";

export class VDOMNode
{
    public constructor(
        public children: VDOMNode[] = [],
    )
    {

    }

    toHTML(indent: number = 0, settings?: HTMLGeneratorSettings): string
    {
        let result = "";
        for (let child of this.children)
        {
            result += child.toHTML(indent, settings);
        }
        return result;
    }
};