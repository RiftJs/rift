import { Project } from "src/core/project";
import { Builder } from "./builder";

export type PluginProvider = Plugin | Promise<Plugin> | (() => Plugin | Promise<Plugin>);

export interface Plugin
{
    init(builder: Builder): void | Promise<void>;

    cleanup?(builder: Builder): void | Promise<void>;
    build?(builder: Builder): void | Promise<void>;
};