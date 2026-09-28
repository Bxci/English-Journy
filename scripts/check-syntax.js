#!/usr/bin/env node
/* scripts/check-syntax.js — runs `node --check` on every JS file of the project. */
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const files = [];
(function walk(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(d => {
    if (d.name === "node_modules" || d.name.startsWith(".")) return;
    const p = path.join(dir, d.name);
    if (d.isDirectory()) walk(p); else if (d.name.endsWith(".js")) files.push(p);
  });
})(root);
let failed = 0;
files.sort().forEach(f => {
  try { execFileSync(process.execPath, ["--check", f], { stdio: "pipe" }); console.log("ok   " + path.relative(root, f)); }
  catch (e) { failed++; console.log("FAIL " + path.relative(root, f) + "\n" + e.stderr.toString()); }
});
console.log(files.length + " files checked, " + failed + " failed.");
process.exit(failed ? 1 : 0);
