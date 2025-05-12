import { HTMLGeneratorSettings } from "./document";
import { VDOMNode } from "./node";

export class VDOMTextNode extends VDOMNode
{
    public constructor(
        public text: string,
    )
    {
        super();
    }

    toHTML(indent: number = 0, settings?: HTMLGeneratorSettings): string
    {
        const mode = settings?.renderMode ?? "preserve";
        const indentSize = settings?.indent ?? 2;
        const pad = " ".repeat(indent * indentSize);

        let text = this.text;

        if (mode === "minify")
        {
            text = text.trim();
            return text;
        }

        if (mode === "pretty")
        {
            text = text.trim();
            if (text.length === 0) return "";
            return pad + text + "\n";
        }

        // "preserve" mode — return exactly as-is, including leading/trailing whitespace
        return pad + text + "\n";
    }

};