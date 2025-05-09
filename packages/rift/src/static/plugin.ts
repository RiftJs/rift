
import { copyFileSync, mkdirSync } from "fs";
import { globSync } from "glob";
import { dirname, join, relative } from "path";
import { Plugin, PluginProvider } from "src/core";
import { Builder } from "src/core/builder";
import { Logger } from "src/core/logger";


export interface StaticAssetOptions
{
    src: string;
    dest: string;
};

/*
* Plugin responsible for adding static files to the build.
*/
export class StaticPlugin implements Plugin
{
    constructor(
        public readonly options: StaticAssetOptions[],
    )
    {
    }

    init(builder: Builder)
    {

    }

    async build(builder: Builder)
    {
        let i = 0;

        for (let pattern of this.options)
        {
            let assets = globSync(pattern.src, { cwd: builder.project.sourceDir, nodir: true })

            for (let asset of assets)
            {
                Logger.verbose(`Copying asset: ${asset}`, "RiftStatic");

                let assetPath = join(builder.project.sourceDir, asset);
                let targetPath = join(builder.project.outDir, pattern.dest, asset);


                // create the directory if it does not exist
                const dir = dirname(targetPath);

                mkdirSync(dir, { recursive: true });

                // write the file to the dist directory
                copyFileSync(assetPath, targetPath);

                let permalink = relative(builder.project.outDir, targetPath).replace(/\\/g, "/");
                if (!permalink.startsWith("/"))
                {
                    permalink = "/" + permalink;
                }

                builder.permalinks.add(permalink);
                ++i;
            }
        }

        Logger.log(`📁 Copied ${i} assets`, "RiftStatic");
    }
}

export function staticAssets(options: StaticAssetOptions[]): PluginProvider
{
    return new StaticPlugin(options);
}