// tests/types-exported.test.ts
// This test verifies that the built package exports the expected TypeScript types.
// It uses TypeScript's type-checking to ensure the types are present and correct.

import { describe, it, expectTypeOf } from "vitest";
import type { Logger } from "../dist/index.js";

describe("types exported from build", () => {
  it("should export Logger type", () => {
    // This will fail to compile if Logger is not exported or is the wrong shape
    expectTypeOf<Logger>().toMatchTypeOf<{
      debug: (..._args: unknown[]) => void;
      info: (..._args: unknown[]) => void;
      warn: (..._args: unknown[]) => void;
      error: (..._args: unknown[]) => void;
      log: (..._args: unknown[]) => void;
    }>();
  });
});
