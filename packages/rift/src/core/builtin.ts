import { TextController } from "src/controllers/text.controller";
import { RiftController } from "src/controllers/rift.controller";
import { TextFile } from "src/files/text.file";
import { FactoryRegistryEntry } from "./project";

export const BUILT_IN_HANDLERS: FactoryRegistryEntry[] = [
    // Raw text files 
    {
        patterns: [
            "**/*.html",
            "**/*.htm",
            "**/*.xml",
            "**/*.xhtml",
            "**/*.xht",
            "**/*.xhtm",
            "**/*.xhtml",
        ],
        fileFactory: (path) => new TextFile(path, { type: "html" }),
        controllerFactory: (file) => new TextController(file),
    },
    // Css
    {
        patterns: [
            "**/*.css",
        ],
        fileFactory: (path) => new TextFile(path, { type: "css" }),
        controllerFactory: (file) => new TextController(file),
    },
    // Json
    {
        patterns: [
            "**/*.json",
        ],
        fileFactory: (path) => new TextFile(path, { type: "json" }),
        controllerFactory: (file) => new TextController(file),
    },
    // Javascript files
    {
        patterns: [
            "**/*.js",
        ],
        fileFactory: (path) => new TextFile(path, { type: "javascript" }),
        controllerFactory: (file) => new TextController(file),
    },
    // Text files
    {
        patterns: [
            "**/*.txt",
            "**/*.text",
        ],
        fileFactory: (path) => new TextFile(path, { type: "text" }),
        controllerFactory: (file) => new TextController(file),
    },
    // Custom controller to render a file
    {
        patterns: [
            "**/*.controller.ts",
            "**/*.controller.js",
        ],
        fileFactory: (path) => new TextFile(path, { type: "controller" }),
        controllerFactory: (file) => new RiftController(file),
    },
];