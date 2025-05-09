// tests/build.test.ts
// This test verifies that the built package in 'dist/' is valid and exports the expected API.
// It should be run after 'yarn build'.

import { describe, it, expect } from "vitest";

// Import the built output (ESM)
import * as logface from "../dist/index.js";

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
