import { createWriteStream, existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { globSync } from "glob";
import micromatch from "micromatch";
import { dirname, extname, join, normalize } from "path";
import { Readable } from "stream";
import { BUILT_IN_HANDLERS } from "./builtin";
import { Context } from "./context";
import { Controller } from "./controller";
import { File } from "./file";
import { Logger } from "./logger";
import { Plugin } from "./plugin";
import { ControllerFactory, FactoryRegistryEntry, FileHandlerFactory, Project } from "./project";

export class Builder
{

    // Built in file handlers
    constructor(
        public readonly project: Project,
    )
    {
    }

    public plugins: Plugin[] = [];
    async initPlugins()
    {
        for (let pluginProvider of this.project.config.plugins)
        {
            let plugin = await pluginProvider;
            if (typeof plugin === "function")
            {
                plugin = await plugin();
            }

            if (plugin instanceof Error)
            {
                throw plugin;
            }

            this.plugins.push(plugin);

            Logger.debug(`Initializing plugin: ${plugin.constructor.name}`, "RiftBuilder");
            await plugin.init(this);
        }
    }

    public pageFactory: FactoryRegistryEntry[] = BUILT_IN_HANDLERS;
    addPageFactory(patterns: string | string[], fileFactory: FileHandlerFactory, controllerFactory: ControllerFactory): void
    {
        if (typeof patterns === "string")
        {
            patterns = [patterns];
        }

        this.pageFactory.unshift({ patterns, fileFactory, controllerFactory });
    }

    files: { [key: string]: { file: File, controller: Controller } } = {};
    async loadFile(filePath: string): Promise<{ file: File, controller: Controller } | null>
    {
        if (this.files[filePath])
        {
            return this.files[filePath];
        }

        filePath = normalize(filePath);

        for (let entry of this.pageFactory)
        {
            for (let pattern of entry.patterns)
            {
                if (micromatch.isMatch(filePath, pattern, { dot: true, basename: false }))
                {
                    let file = await entry.fileFactory(filePath);
                    let controller = await entry.controllerFactory(file);

                    this.files[filePath] = { file, controller };

                    return { file, controller };
                }
            }
        }

        return null;
    }

    permalinks: Set<string> = new Set<string>();

    async buildPages()
    {
        let pages = globSync("**/*", { cwd: this.project.siteDir, nodir: true })

        for (let page of pages)
        {
            let pagePath = join(this.project.siteDir, page);

            let file = await this.loadFile(pagePath);
            if (!file)
            {
                Logger.warn(`No file handler for ${pagePath}`, "Rift");
                continue;
            }

            await this.buildPage(file.file, file.controller);
        }

        Logger.log(`🔨 Built ${pages.length} pages`, "Rift");
    }


    async buildPage(file: File, controller: Controller): Promise<void>
    {
        Logger.debug(`Building page: ${file.path}`, "Rift");

        // Create a context for the page
        let context = new Context(this.project);

        // Generate links
        await controller.params(context);

        if (!context.params || context.params.length == 0)
        {
            await this.buildParameterizedPage(controller, context, {});
            return;
        }

        for (let param of context.params)
        {
            await this.buildParameterizedPage(controller, context, param);
        }
    }

    async buildParameterizedPage(controller: Controller, context: Context, params: Record<string, any>): Promise<void>
    {
        Logger.debug(`Building page with controller: ${controller.constructor.name}`, "RiftBuilder");

        let permalink = await controller.permalink(context, params);

        // If no permalink is returned, skip this page
        if(!permalink)
        {
            Logger.warn(`No permalink for ${controller.file.path}, skipping page`, "Rift");
            return;
        }

        // validate the permalink - it should be a valid url path
        if (!permalink.startsWith("/") || !/^\/[a-zA-Z0-9\-._~!$&'()*+,;=:@\/%]*$/.test(permalink))
        {
            throw new Error(`Invalid permalink: "${permalink}" from "${controller.file.path}"`);
        }


        if (this.permalinks.has(permalink))
        {
            throw new Error(`Duplicate permalink: "${permalink}" from "${controller.file.path}"`);
        }
        this.permalinks.add(permalink);

        Logger.debug(`Rendering page: ${controller.file.path} -> ${permalink}`, "RiftBuilder");
        let content = await controller.render(context, params);

        let extension = extname(permalink);
        let outputPath = normalize(permalink);

        if (extension.length == 0)
        {
            extension = controller.extname;
        }

        if (permalink.endsWith("/"))
        {
            outputPath = join(outputPath, `index${extension}`);
        }

        await this.outputFile(outputPath, content);
    }

    async cleanup()
    {
        for (let plugin of this.plugins)
        {
            await plugin.cleanup?.(this);
        }

        // remove the dist directory
        try
        {
            // check if the directory exists
            if (existsSync(this.project.outDir))
            {
                // remove the directory and its contents
                rmSync(this.project.outDir, { recursive: true, force: true });
            }
        }
        catch (err)
        {
            console.error("Error removing dist directory:", err);
        }
    }

    async build(): Promise<void>
    {
        this.permalinks.clear();

        for (let plugin of this.plugins)
        {
            await plugin.build?.(this);
        }

        await this.buildPages();
    }

    // output a file to the dist directory, from a buffer, stream or string
    async outputFile(filePath: string, data: Buffer | Readable | string | null): Promise<void>
    {
        if (!data)
        {
            console.error("No data to write to file:", filePath);
            return;
        }

        let targetPath = join(this.project.outDir, filePath);

        // create the directory if it does not exist
        const dir = dirname(targetPath);

        // delete existing file if it exists
        try
        {
            // check if the file exists
            if (existsSync(targetPath))
            {
                // remove the file
                rmSync(targetPath, { recursive: true, force: true });
            }
        }
        catch (err) { }

        if (!existsSync(dir))
        {
            mkdirSync(dir, { recursive: true });
        }

        // write the file to the dist directory
        if (Buffer.isBuffer(data))
        {
            writeFileSync(targetPath, data);
            return;
        }

        if (data instanceof Readable)
        {
            return new Promise<void>((resolve, reject) =>
            {
                const writeStream = createWriteStream(targetPath);
                data.pipe(writeStream);

                writeStream.on("finish", () =>
                {
                    writeStream.close(); // optional; Node auto-closes after 'finish'
                    resolve();
                });

                writeStream.on("error", (err) =>
                {
                    console.error("WriteStream Error:", err);
                    reject(err);
                });

                data.on("error", (err) =>
                {
                    console.error("Readable Error:", err);
                    reject(err);
                });
            });
        }

        writeFileSync(targetPath, data);
    }

};