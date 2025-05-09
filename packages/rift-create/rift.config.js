import { riftConfig } from "@riftjs/rift/core";
import { markdownPlugin } from "@riftjs/rift/markdown";
import { njkPlugin } from "@riftjs/rift/njk";
import { staticAssets } from "@riftjs/rift/static";

export default riftConfig({
    sourceDir: "./src/",
    outDir: "./dist/",
    plugins: [
        njkPlugin(),
        markdownPlugin(),
        staticAssets([
            {
                src: "./assets/**/*",
                dest: "./"
            }
        ])
    ]
});