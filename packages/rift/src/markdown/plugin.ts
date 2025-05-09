import { Builder } from "src/core/builder";
import { Plugin } from "src/core/plugin";
import { MarkdownFile } from "./markdown.file";
import { MarkdownController } from "./markdown.controller";
import MarkdownIt from "markdown-it";


class MarkdownLPlugin implements Plugin
{
    md: MarkdownIt;
    constructor(options: MarkdownIt.Options = {})
    {
        this.md = new MarkdownIt(options);
    }

    init(builder: Builder)
    {
        builder.addPageFactory("**/*.md", (path) => new MarkdownFile(path, { type: "md" }), async (file) =>
        {
            return new MarkdownController(this.md, file);
        });
    }
};

export const markdownPlugin = (config?: any) => new MarkdownLPlugin(config);