
import { basename, dirname, extname, join, relative } from "path";
import { Context } from "./context";
import { File, Metadata } from "./file";

export type Param = { [key: string]: any };
export type Params = Param[];

/*
* Controllers are responsible for generating the output for a given file and providing route generation
* and metadata extraction.
*/
export class Controller
{
    get extname()
    {
        return this.file.extname;
    }

    constructor(
        public readonly file: File
    )
    {
    }

    public async params(context: Context): Promise<void>
    {
    }

    public async permalink(context: Context, params: Record<string, any>): Promise<string | null>
    {
        let metadata = await this.metadata();

        if (metadata.permalink !== undefined)
        {
            return metadata.permalink;
        }

        // remote extesion from path
        let path = relative(context.project.siteDir, dirname(this.file.path)).replace(/\\/g, "/");
        let filename = basename(this.file.path, extname(this.file.path));

        if (filename == "index")
        {
            return `${path}/`
        }

        let permalink = join(path, filename).replace(/\\/g, "/");

        if (!permalink.startsWith("/"))
        {
            permalink = `/${permalink}`;
        }

        if (!permalink.endsWith("/"))
        {
            permalink = `${permalink}/`;
        }

        return permalink;

    }

    public async render(context: Context, params: Record<string, any>): Promise<string>
    {
        return this.file.content;
    }

    public async metadata(): Promise<Metadata>
    {
        return this.file.metadata;
    }
};