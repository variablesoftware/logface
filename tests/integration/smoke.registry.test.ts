// 🔥💨🧪 Smoke test: install latest published logface from npm and run a basic usage
// This test is slow and requires network access. Mark as skipped by default.

import { test } from "vitest";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

function run(cmd, opts = {}) {
  return execSync(cmd, { stdio: "inherit", ...opts });
}

const isSmoke =
  typeof process !== "undefined" &&
  process.env &&
  process.env.SMOKE_REGISTRY === "1";
const testOrSkip = isSmoke ? test : test.skip;

testOrSkip(
  "npm package can be installed and imported from registry (smoke test)",
  async () => {
    // Use a temp directory for the test
    const tmpDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "logface-smoke-registry-"),
    );
    const origCwd = process.cwd();
    try {
      process.chdir(tmpDir);
      run("npm init -y");
      // Install the package from the registry (latest version)
      run("npm install @variablesoftware/logface");
      // Read the installed package's package.json to find the entry point
      const pkgJson = JSON.parse(
        fs.readFileSync(
          path.join(
            tmpDir,
            "node_modules",
            "@variablesoftware",
            "logface",
            "package.json",
          ),
          "utf8",
        ),
      );
      const entry = pkgJson.main || "index.js";
      const entryPath = path.join(
        tmpDir,
        "node_modules",
        "@variablesoftware",
        "logface",
        entry,
      );
      await import(entryPath);
      console.log(
        "Smoke test passed: package can be installed and imported from registry.",
      );
    } catch (e) {
      console.error("Smoke test from registry failed:", e);
      throw e;
    } finally {
      process.chdir(origCwd);
      // Clean up temp dir (optional, not deleting for debugging)
    }
  },
  120000,
);
