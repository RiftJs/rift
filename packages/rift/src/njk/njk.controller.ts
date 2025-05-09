import nunjucks, { ILoaderAny } from "nunjucks";
import { Context } from "src/core/context";
import { Controller } from "src/core/controller";
import { File } from "src/core/file";
import { makeNjkPagePathSlug } from "./njk-rift-loader";
import { join, normalize, relative } from "path";
import { NjkConfig } from "./njk.config";
import { existsSync } from "fs";

export class NjkController extends Controller
{
    constructor(
        public readonly loader: ILoaderAny,
        public readonly file: File,
        public readonly config: NjkConfig,
        public readonly environment: nunjucks.Environment,
    )
    {
        super(file);
    }

    override get extname()
    {
        return ".html";
    }

    async getController(context: Context)
    {
        if (this.file.metadata.controller)
        {
            let controllerPath = normalize(join(context.project.sourceDir, this.config.controllerDir, this.file.metadata.controller));
            if (!controllerPath.endsWith(".ts"))
            {
                controllerPath = controllerPath + ".ts";
            }

            if (!existsSync(controllerPath))
            {
                throw new Error(`Controller '${controllerPath}' not found`);
            }

            let controller = await import(controllerPath);
            if (!controller.default)
            {
                throw new Error(`Controller ${controllerPath} does not export a default function`);
            }

            return new controller.default(this);
        }

        return null;
    }

    dataContext?: any;
    override async params(context: Context): Promise<void>
    {
        let controller = await this.getController(context);
        if (controller)
        {
            if (controller.params && typeof controller.params === "function")
            {
                await controller.params(context);
            }
        }

        if (this.file.metadata.params)
        {
            for (let param of this.file.metadata.params)
            {
                context.param(param);
            }
        }
    }

    override async permalink(context: Context, params: Record<string, any>): Promise<string | null>
    {
        let controller = await this.getController(context);
        if (controller)
        {
            if (controller.permalink && typeof controller.permalink === "function")
            {
                return await controller.permalink(context, params);
            }

            if (controller.permalink && typeof controller.permalink === "string")
            {
                return controller.permalink;
            }
        }

        return super.permalink(context, params);
    }

    override async render(context: Context, params: Record<string, any>): Promise<string>
    {
        let metadata = await this.metadata();

        let renderContext = { metadata: metadata, ...context.data, ...params };

        let content = this.environment.render(normalize(relative(context.project.sourceDir, this.file.path)), renderContext);

        if (metadata.layout)
        {
            let layout = this.environment.render(metadata.layout, {
                content: content,
                metadata: metadata,
                ...context.data,
                ...params
            });
            return layout;
        }

        return content;
    }
}