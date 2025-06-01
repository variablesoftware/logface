// tests/build.test.ts
// This test verifies that the built package in 'dist/' is valid and exports the expected API.
// It should be run after 'pnpm run build'.

import { describe, it, expect } from "vitest";
import { existsSync } from "fs";
import { join } from "path";

const distPath = join(__dirname, "../dist/index.js");

if (!existsSync(distPath)) {
  describe("build output", () => {
    it.skip("build output missing: dist/index.js not found. Run 'pnpm run build' before testing.", () => {
      // Skipped
    });
  });
} else {
  // Import the built output (ESM)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const logface = require(distPath);

  describe("build output", () => {
    it("should export 'log' and 'setup'", () => {
      expect(logface).toHaveProperty("log");
      expect(typeof logface.log).toBe("object");
      expect(logface).toHaveProperty("setup");
      expect(typeof logface.setup).toBe("function");
    });

    it("log.info should be callable", () => {
      expect(typeof logface.log.info).toBe("function");
    });
  });
}
