// tests/unit/logface-suppress.test.ts
// This file's tests have been split into smaller, focused files:
//   - logface-suppress.test.ts (this file)
//   - logface-wildcard.test.ts
//   - logface-multimatch.test.ts
//   - logface-levelonly.test.ts
//   - logface-nomatch.test.ts
//   - logface-runtimechange.test.ts
// You may safely delete this file if all tests pass in the new structure.
// Tests for LOG env suppressing logs not matching filter
import logface from "../../../src";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

describe("LOG env suppressing logs", () => {
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let originalLogEnv: string | undefined;

  beforeEach(() => {
    infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    originalLogEnv = process.env.LOG;
  });

  afterEach(() => {
    infoSpy.mockRestore();
    if (originalLogEnv === undefined) delete process.env.LOG;
    else process.env.LOG = originalLogEnv;
  });

  it("should suppress logs not matching LOG filter", () => {
    process.env.LOG = "auth";
    logface.options({ tag: "notauth" }).info("should not log");
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it("should not match unrelated scope", () => {
    process.env.LOG = "metrics";
    logface.options({ tag: "auth" }).info("should not match");
    expect(infoSpy).not.toHaveBeenCalled();
  });
});
