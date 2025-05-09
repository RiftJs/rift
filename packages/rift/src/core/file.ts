import { readFileSync } from "fs";
import { basename, extname } from "path";
import { Context } from "./context";

export type Metadata = { [key: string]: any };

export class File
{
    constructor(
        public readonly path: string,
        public readonly metadata: Metadata = {},
    )
    {
    }

    protected _rawContent?: string;
    public get rawContent(): string
    {
        if (this._rawContent === undefined)
        {
            this._rawContent = readFileSync(this.path, "utf-8");
        }

        return this._rawContent;
    }

    public get content(): string
    {
        // this is inteded to be overridden by subclasses
        // to provide custom content processing
        return this.rawContent;
    }

    public get extname(): string
    {
        return extname(this.path);
    }

    public get basename(): string
    {
        return basename(this.path);
    }

};