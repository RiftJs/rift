import { PluginProvider } from "src/core/plugin";
import { Logger } from "./logger";
import { existsSync } from "fs";
import { join } from "path";

export interface Config
{
    sourceDir: string;

    outDir: string;

    siteDir: string;

    listen: {
        port: number;
        host: string;
    };

    plugins: PluginProvider[];
};

export const DEFAULT_CONFIG: Config = {
    sourceDir: "src/",
    outDir: "dist/",
    siteDir: "site/",


    plugins: [],

    listen: {
        port: 3000,
        host: "localhost",
    },
};

export type ConfigProvider = Config | (() => Config);
export function riftConfig(config: Partial<Config>): ConfigProvider
{
    return () => ({
        ...DEFAULT_CONFIG,
        ...config,
    });
}

export function loadConfig(rootDir: string): Config
{
    // find a config file in the root directory
    let configFile = join(rootDir, "rift.config.js");

    let projectConfig = structuredClone(DEFAULT_CONFIG);

    if (!existsSync(configFile))
    {
        Logger.error(`Config file not found: ${configFile}`, "Rift");
        Logger.error(`Working directory: ${rootDir}`, "Rift");
        Logger.error("Please create a config file in the root directory.", "Rift");

        throw new Error("rift.config.js not found.");
    }

    // load the config file
    let config = require(configFile);

    if (config && config.default)
    {
        config = config.default as ConfigProvider;
    }

    config = config as ConfigProvider;

    if (typeof config === "function")
    {
        config = config();
    }

    Object.assign(projectConfig, config);

    return projectConfig;

}