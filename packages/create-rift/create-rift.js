#!/usr/bin/env node

import chalk from "chalk";
import { execSync } from "child_process";
import fs from "fs";
import fse from "fs-extra";
import inquirer from "inquirer";
import fetch from "node-fetch";
import ora from "ora";
import { pipeline } from "stream";
import unzipper from "unzipper";
import { promisify } from "util";

const streamPipeline = promisify(pipeline);

console.log(chalk.bold.blue("\n🚀 Rift Project Generator\n"));

const { projectName } = await inquirer.prompt([
    {
        name: "projectName",
        type: "input",
        message: "📁 Project folder name:",
        default: "my-rift-site",
    },
]);

const target = projectName.trim();

if (fs.existsSync(target))
{
    console.error(chalk.red(`❌ Folder '${target}' already exists.`));
    process.exit(1);
}

const TMP_ZIP = "rift-starter.tmp";
const ZIP_URL = "https://github.com/riftjs/rift-starter/archive/refs/heads/master.zip";

const spinner = ora("📦 Downloading template...").start();
try
{
    const res = await fetch(ZIP_URL);
    if (!res.ok) throw new Error(`Failed to download: ${res.statusText}`);

    await streamPipeline(res.body, fs.createWriteStream(TMP_ZIP));
    spinner.succeed("✅ Downloaded");
} catch (err)
{
    spinner.fail("❌ Failed to download zip");
    console.error(err);
    process.exit(1);
}

const extractSpinner = ora("📂 Extracting...").start();
try
{
    await fs.createReadStream(TMP_ZIP)
        .pipe(unzipper.Extract({ path: "." }))
        .promise();

    // Copy folder
    await fse.copy("rift-starter-main", target);
    // Delete original
    await fse.remove("rift-starter-main");

    //fs.renameSync("rift-starter-main", target);
    fs.unlinkSync(TMP_ZIP);
    extractSpinner.succeed("✅ Extracted");
} catch (err)
{
    extractSpinner.fail("❌ Failed to extract zip");
    console.error(err);
    process.exit(1);
}

const installSpinner = ora("📥 Installing dependencies...").start();
try
{
    execSync(`npm install`, { stdio: "inherit", cwd: target });
    installSpinner.succeed("✅ Dependencies installed");
} catch (err)
{
    installSpinner.fail("❌ npm install failed");
    console.error(err);
    process.exit(1);
}

console.log(
    chalk.green("\n✅ Project ready!\n") +
    chalk.gray("👉 Next:\n") +
    `  ${chalk.cyan(`cd ${target}`)}\n` +
    `  ${chalk.cyan("npm run dev")}\n`
);
