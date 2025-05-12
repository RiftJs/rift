import { VDOMNode } from "./node";

type RenderMode = "pretty" | "minify" | "preserve";

export interface HTMLGeneratorSettings
{
    renderMode?: RenderMode;
    indent?: number;
};

export class VDOMDocument
{
    constructor(
        public doctype?: string,
        public children: VDOMNode[] = [],
    )
    {
    }


    toHTML(settings?: HTMLGeneratorSettings): string
    {
        const mode = settings?.renderMode ?? "pretty";
        const indentSize = settings?.indent ?? 2;

        let head = "<!DOCTYPE html>\n";
        if (this.doctype)
        {
            head = `<!DOCTYPE ${this.doctype}>\n`;
        }

        return head + this.children.map(child => child.toHTML(0, {
            renderMode: mode,
            indent: indentSize,
        })).join("");
    }
};