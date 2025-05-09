#!/usr/bin/env node

const { execSync } = require("child_process");
const path = require("path");

const target = process.argv[2] || "my-rift-site";

console.log(`🚀 Creating Rift project in '${target}'`);

execSync(`git clone https://github.com/riftjs/rift-starter ${target}`, { stdio: "inherit" });
execSync(`cd ${target} && npm install`, { stdio: "inherit" });

console.log(`✅ Done! cd ${target} && npm run dev`);
