import { existsSync } from "fs";
import { join, resolve } from "path";
import { Plugin } from "src/core/plugin";
import { Config, ConfigProvider, DEFAULT_CONFIG, loadConfig } from "./config";
import { Controller } from "./controller";
import { File } from "./file";
import { BUILT_IN_HANDLERS } from "./builtin";
import { Logger } from "./logger";
import { Builder } from "./builder";

export type FileHandlerFactory = (path: string) => File | Promise<File>;
export type ControllerFactory = (file: File) => Controller | Promise<Controller>;

export type FactoryRegistryEntry = {
    patterns: string[];
    fileFactory: FileHandlerFactory;
    controllerFactory: ControllerFactory;
};

export class Project
{

    constructor(
        // the project root directory
        public readonly rootDir: string,
        public readonly config: Config,
    )
    {
    }

    get sourceDir(): string
    {
        return resolve(join(this.rootDir, this.config.sourceDir));
    }

    get siteDir(): string
    {
        return resolve(join(this.sourceDir, this.config.siteDir));
    }

    get outDir(): string
    {
        return resolve(join(this.rootDir, this.config.outDir));
    }

    async builder(): Promise<Builder>
    {
        const builder = new Builder(this);

        await builder.initPlugins();
    

        return builder;
    }
}

export function createProject(rootDir: string, configOptions?: Partial<Config>): Project
{
    rootDir = resolve(rootDir);

    let projectConfig = loadConfig(rootDir);

    if (configOptions)
    {
        Object.assign(projectConfig, configOptions);
    }

    return new Project(rootDir, projectConfig);
}