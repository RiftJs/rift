import matter from "gray-matter";
import { File, Metadata } from "src/core/file";

/*
* Standard text file with metadata in frontmatter
*/
export class TextFile extends File
{
    protected frontmatter: matter.GrayMatterFile<string>;

    constructor(
        path: string,
        metadata: Metadata,
    )
    {
        super(path, metadata);

        this.frontmatter = matter(this.rawContent);

        Object.assign(this.metadata, this.frontmatter.data);
    }

    override get content(): string
    {
        return this.frontmatter.content;
    }
}
