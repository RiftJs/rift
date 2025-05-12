import { HTMLGeneratorSettings } from "./document";
import { VDOMNode } from "./node";
import { VDOMTextNode } from "./text";

export interface VDOMAttribute
{
    name: string;
    value?: string;
};


const RAW_TEXT_ELEMENTS = new Set(["pre", "textarea", "script", "style", "xmp"]);

const isRawTextElement = (name: string) => RAW_TEXT_ELEMENTS.has(name.toLowerCase());


export class VDOMElementNode extends VDOMNode
{
    public constructor(
        public name: string,
        public attributes: VDOMAttribute[] = [],
    )
    {
        super();
    }

    toHTML(indent: number = 0, settings?: HTMLGeneratorSettings): string
    {
        const mode = settings?.renderMode ?? "pretty";
        const indentSize = settings?.indent ?? 2;
        const pad = " ".repeat(indent * indentSize);
        const isRaw = isRawTextElement(this.name);

        let result = mode === "pretty" ? pad : "";
        result += `<${this.name}`;

        for (let attr of this.attributes)
        {
            result += attr.value != null && attr.value !== ""
                ? ` ${attr.name}="${attr.value}"`
                : ` ${attr.name}`;
        }

        if (!this.children.length)
        {
            return result + (mode === "minify" ? "/>" : " />") + (mode === "pretty" ? "\n" : "");
        }

        result += ">";

        if (mode === "pretty" && !isRaw) result += "\n";

        for (let child of this.children)
        {
            if (child instanceof VDOMTextNode)
            {
                if (isRaw)
                {
                    result += child.toHTML(indent, { renderMode: "preserve" });
                    continue;
                }
            }
            const childHTML = child.toHTML(indent + 1, settings);
            if (mode === "minify")
            {
                result += childHTML.trim();
            } else if (mode === "pretty" && !isRaw)
            {
                result += childHTML;
            } else
            {
                result += childHTML;
            }
        }

        if (mode === "pretty" && !isRaw) result += pad;
        result += `</${this.name}>`;

        if (mode === "pretty") result += "\n";
        return result;
    }


};