#!/usr/bin/env tsx

import { spawn } from 'child_process';
import chokidar from 'chokidar';
import { Command } from "commander";
import { Builder } from "src/core/builder";
import { LogFlags, Logger } from "src/core/logger";
import { createProject } from "src/core/project";
import { DevServer } from "src/devserver/dev-server";



const program = new Command();

program
    .name("rift")
    .description("Rift SSG CLI")
    .version("0.1.0")
    .option("-v, --verbose", "Enable verbose logging")
    .option("-d, --debug", "Enable debug logging")
    .option("-t, --trace", "Enable trace logging")
    .option("-q, --quiet", "Enable quiet logging")


program
    .hook("preAction", () =>
    {
        const opts = program.opts();

        // Set Logging Level
        if (opts.quiet && opts.debug)
        {
            Logger.error("You cannot use --quiet and --debug at the same time.");
            process.exit(1);
        }

        if (opts.quiet && opts.verbose)
        {
            Logger.error("You cannot use --quiet and --verbose at the same time.");
            process.exit(1);
        }

        if (opts.quiet && opts.trace)
        {
            Logger.error("You cannot use --quiet and --trace at the same time.");
            process.exit(1);
        }


        if (opts.debug)
        {
            Logger.flags = Logger.flags | LogFlags.Debug;
        }

        if (opts.verbose)
        {
            Logger.flags = Logger.flags | LogFlags.Verbose;
        }

        if (opts.trace)
        {
            Logger.flags = Logger.flags | LogFlags.Trace;
        }

    });

program
    .on('command:*', () =>
    {
        Logger.error(`❌ Unknown command: ${program.args.join(' ')}`);
        process.exit(1);
    });


program
    .command("build")
    .description("Generate static site output")
    .option("-p, --path <path>", "Path to the project", "./")
    .option("-c, --clean", "Clean the output directory before building")
    .action(async (options) =>
    {
        const path = options.path || "./";

        let project = createProject(path, {});

        Logger.log("🛠️ Building project...", "Rift");

        const builder = await project.builder();

        try
        {

            if (options.clean)
            {
                Logger.log("🧹 Cleaning output directory...", "Rift");
                await builder.cleanup();
            }


            await builder.build();

            Logger.success("✅ Build completed.", "Rift");
        }
        catch (error)
        {
            Logger.error("❌ Build failed.", "Rift");
            if (error instanceof Error)
            {
                Logger.error(error.message, "Rift");
                console.error(error);
                process.exit(1);
            }

            Logger.error("Unknown error", "Rift");
            console.error(error);
            process.exit(1);


        }
    });

let buildProcess: ReturnType<typeof spawn> | null = null;


program
    .command("dev")
    .description("Start dev server")
    .option("-p, --path <path>", "Path to the project", "./")
    .option("-c, --clean", "Clean the output directory before building")
    .action(async (options) =>
    {

        const path = options.path || "./";

        Logger.debug(`Path: ${path}`, "Rift");
        let project = createProject(path, {});

        let devServer = new DevServer(project.outDir, project.config.listen.port, project.config.listen.host);
        await devServer.serve();
        await devServer.livereload();


        // Start watching the source directory for changes

        // --- Start Watcher ---
        const watcher = chokidar.watch(project.sourceDir, {
            ignored: /(^|[\/\\])\../, // ignore dotfiles
            persistent: true,
            ignoreInitial: true,
            depth: Infinity,
            awaitWriteFinish: {
                stabilityThreshold: 100,
                pollInterval: 10,
            },
        });



        async function runBuild()
        {
            Logger.log("♻️ Changes detected. Rebuilding...", "Rift");

            if (buildProcess)
            {
                buildProcess.kill("SIGTERM");
            }

            let cliPath = require.resolve("rift/bootstrap.js");
            buildProcess = spawn(process.execPath, [cliPath, "build", "--path", path], {
                stdio: "inherit",
                cwd: process.cwd(),
                env: process.env,
            });

            buildProcess.on("exit", (code) =>
            {
                buildProcess = null;
            });
        }

        let ready = false;
        watcher
            .on("add", path =>
            {
                Logger.verbose(`📄 File added: ${path}`, "Rift");
                if (ready)
                {
                    runBuild();
                }
            })
            .on("change", path =>
            {
                Logger.verbose(`✏️  File changed: ${path}`, "Rift");
                if (ready)
                {
                    runBuild();
                }
            })
            .on("unlink", path =>
            {
                Logger.verbose(`❌ File removed: ${path}`, "Rift");
                if (ready)
                {
                    runBuild();
                }
            })
            .on("addDir", path =>
            {
                Logger.log(`📁 Dir added: ${path}`, "Rift");
                if (ready)
                {
                    runBuild();
                }
            })
            .on("unlinkDir", path =>
            {
                Logger.verbose(`🗑️  Dir removed: ${path}`, "Rift");
                if (ready)
                {
                    runBuild();
                }
            })
            .on("error", error => Logger.error(`⚠️  Watcher error: ${error}`))
            .on("ready", () =>
            {
                Logger.verbose("✅ Initial scan complete. Watching for changes...", "Rift");

                ready = true;
                runBuild();
            });



    });

// default command
program
    .action(() =>
    {
        Logger.log("No command specified. Use --help for more information.", "Rift");
    });

program.parse(process.argv);