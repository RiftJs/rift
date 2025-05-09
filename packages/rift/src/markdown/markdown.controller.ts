import { Context } from "src/core/context";


import markdownit from 'markdown-it'
import { File } from "src/core/file";
import { Controller } from "src/core/controller";

export class MarkdownController extends Controller
{
    override get extname()
    {
        return ".html";
    }

    constructor(
        public readonly md: markdownit,
        public readonly file: File,
        public readonly env?: any,
    )
    {
        super(file);
    }

    override async render(context: Context, params: Record<string, any>): Promise<string>
    {
        let content = await this.file.content;

        return this.md.render(content, this.env);
    }
};