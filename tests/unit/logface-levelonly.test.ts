// tests/unit/logface-levelonly.test.ts
// Tests for LOG env with only log level filtering
import logface from "../../src";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

describe("LOG env log level only filtering", () => {
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

  it("should only emit logs for the specified level", () => {
    process.env.LOG = "warn";
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    logface("info", "should not log");
    logface("warn", "should log");
    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[W]\[[a-z0-9_.-]+]/i),
      "should log"
    );
    warnSpy.mockRestore();
  });
});
