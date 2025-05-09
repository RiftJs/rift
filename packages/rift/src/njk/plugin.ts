import { Builder } from "src/core/builder";
import { Plugin } from "src/core/plugin";
import { NjkRiftLoader } from "./njk-rift-loader";
import { defaultNjkConfig, NjkConfig } from "./njk.config";
import { NjkController } from "./njk.controller";
import { NjkFile } from "./njk.file";
import { join, normalize, relative } from "path";
import nunjucks, { ILoaderAny } from "nunjucks";
import MarkdownIt from "markdown-it";

class NjkPlugin implements Plugin
{
    config: NjkConfig;
    environment!: nunjucks.Environment;
    loader!: NjkRiftLoader;

    constructor(
        config: Partial<NjkConfig> = {}
    )
    {
        this.config = {
            ...defaultNjkConfig,
            ...config,
        };

    }

    init(builder: Builder)
    {
        this.loader = new NjkRiftLoader(builder, this.config);
        this.environment = new nunjucks.Environment(this.loader, {
            autoescape: false,
            trimBlocks: true,
            lstripBlocks: true,
        });

        this.config.environment?.(this.environment);

        this.environment.addFilter("json", (value: any) => JSON.stringify(value, null, 2));
        this.environment.addFilter("date", (value: Date) => value.toLocaleDateString());
        this.environment.addFilter("datetime", (value: Date) => value.toLocaleString());
        this.environment.addFilter("markdown", (value: string) => MarkdownIt().render(value));

        // parse template pages
        builder.addPageFactory("**/*.njk", (path) => new NjkFile(path, { type: "njk" }), async (file) =>
        {
            this.loader.cacheTemplate(
                normalize(
                    relative(
                        builder.project.sourceDir,
                        file.path,
                    )
                ),
                await file.content,
            );

            return new NjkController(this.loader, file, this.config, this.environment);
        });
    }
};

export const njkPlugin = (config?: Partial<NjkConfig>) => new NjkPlugin(config);