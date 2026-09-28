/*
  tests/index.js — lets `node --test tests` work on every Node version:
  older Node scans the directory for *.test.js; Node 21+ resolves the path `tests` to this file,
  which loads each test file into the same node:test run.
*/
const fs = require("fs");
const path = require("path");
fs.readdirSync(__dirname).filter(f => f.endsWith(".test.js")).sort().forEach(f => require(path.join(__dirname, f)));
