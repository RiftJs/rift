#!/usr/bin/env node

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const inquirer = require("inquirer");

(async () =>
{
    console.log("🚀 Rift Project Generator");

    const { projectName } = await inquirer.prompt([
        {
            name: "projectName",
            type: "input",
            message: "Project folder name:",
            default: "my-rift-site",
        },
    ]);

    const target = projectName.trim();

    if (fs.existsSync(target))
    {
        console.error(`❌ Folder '${target}' already exists.`);
        process.exit(1);
    }

    console.log(`📦 Creating project in '${target}'...`);
    execSync(`npx degit riftjs/rift-starter ${target}`, { stdio: "inherit" });

    console.log("📥 Installing dependencies...");
    execSync(`cd ${target} && npm install`, { stdio: "inherit" });

    console.log(`✅ Done!`);
    console.log(`👉 cd ${target} && npm run dev`);
})();
