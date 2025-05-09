// tests/integration/npm-smoke.test.ts
// 🔥💨🧪 Smoke test: install latest published logface from npm and run a basic usage
// This test is slow and requires network access. Mark as skipped by default.
import { describe, it, expect } from "vitest";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

describe("npm smoke test: install and use latest @variablesoftware/logface", () => {
  it(
    "should install and run a basic usage",
    async () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "logface-npmtest-"));
      execSync("npm init -y", { cwd: tmpDir, stdio: "ignore" });
      execSync("npm install @variablesoftware/logface@latest", { cwd: tmpDir, stdio: "inherit" });
      // Write test.mjs for ESM compatibility
      fs.writeFileSync(
        path.join(tmpDir, "test.mjs"),
        `import { log } from '@variablesoftware/logface';\nlog.info('hello from npm smoke test');\n`
      );
      // Run with node (ESM)
      const output = execSync("node test.mjs", { cwd: tmpDir }).toString();
      expect(output).toMatch(/hello from npm smoke test/);
    },
    60000 // 60 seconds timeout
  );
});
