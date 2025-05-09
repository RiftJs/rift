import { riftConfig } from "rift/core";
import { njkPlugin } from "rift/njk";
import { markdownPlugin } from "rift/markdown";
import { staticAssets } from "rift/static";

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