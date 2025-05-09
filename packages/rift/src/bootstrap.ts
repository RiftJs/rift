#!/usr/bin/env node

// Force TSLoader to use the correct tsconfig.json
process.env.TS_NODE_PROJECT = require("path").resolve(__dirname, "../tsconfig.json");

// bootstrap.ts (must be CommonJS, outside ESM)
require("tsconfig-paths/register");
require("ts-node/register");
require("./cli/cli.js");
