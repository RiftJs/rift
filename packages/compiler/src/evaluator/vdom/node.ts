export class VDOMNode
{
    public constructor(
        public children: VDOMNode[] = [],
    )
    {

    }

    toHTML(indent: number): string
    {
        let result = "";
        for (let child of this.children)
        {
            result += child.toHTML(indent);
        }
        return result;
    }
};