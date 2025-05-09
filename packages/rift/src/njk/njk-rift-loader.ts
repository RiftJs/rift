import { existsSync, readFileSync } from 'fs';
import * as nunjucks from 'nunjucks';
import { basename, dirname, extname, join, normalize, parse, resolve } from 'path';
import { Builder } from 'src/core/builder';
import { Logger } from 'src/core/logger';
import { NjkConfig } from './njk.config';

export function makeNjkPagePathSlug(path: string): string
{
    let pathSlug = normalize(path.replace(/(\.[^\/\\]+)$/, ""));
    return pathSlug;
}

export class NjkRiftLoader extends nunjucks.Loader implements nunjucks.ILoader
{

    constructor(
        protected readonly builder: Builder,
        protected readonly config: NjkConfig,
    )
    {
        super();
    }

    loadTemplate(path: string): string
    {
        path = normalize(path.replace(/(\.[^\/\\]+)$/, ""));
        let templatPath = resolve(join(this.builder.project.sourceDir, path)) + ".njk";

        Logger.debug(`Loading template '${templatPath}'`, "Nunjucks");

        if (!existsSync(templatPath))
        {
            templatPath = resolve(join(this.builder.project.sourceDir, this.config.templateDir, path)) + ".njk";
        }


        if (!existsSync(templatPath))
        {
            Logger.error(`Template '${templatPath}.njk' not found`, "Nunjucks");

            throw new Error(`Template '${templatPath}.njk' not found`);
        }

        try
        {
            return readFileSync(templatPath).toString("utf-8");
        } catch (e: any)
        {
            Logger.error(`Error loading template '${path}.njk'`, "Nunjucks");

            throw new Error(`Error loading template '${path}.njk': ${e.message}`);
        }
    }

    cacheTemplate(path: string, content: string): void
    {
        this.templates[path] = {
            path: path,
            noCache: true,
            src: content,
        };
    }

    templates: { [key: string]: nunjucks.LoaderSource } = {};

    getSource(path: string): nunjucks.LoaderSource
    {
        if (!this.templates[path])
        {
            this.templates[path] = {
                path: path,
                noCache: true,
                src: this.loadTemplate(path),
            };
        }

        return this.templates[path];

    }
}
