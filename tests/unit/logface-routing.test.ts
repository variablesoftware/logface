// tests/unit/logface-routing.test.ts
// Tests for correct routing to console methods and log level support
import { log } from "../../src";
import { vi, describe, it, expect } from "vitest";

describe("logface routing and log levels", () => {
  it("should support all base log levels", () => {
    const debug = vi.spyOn(console, "debug").mockImplementation(() => {});
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    log.debug("debug msg");
    log.warn("warn msg");
    log.error("error msg");

    expect(debug).toHaveBeenCalledWith(
      expect.stringMatching(/\[D]\[[a-z0-9_.-]+]/i),
      "debug msg",
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringMatching(/\[W]\[[a-z0-9_.-]+]/i),
      "warn msg",
    );
    expect(error).toHaveBeenCalledWith(
      expect.stringMatching(/\[E]\[[a-z0-9_.-]+]/i),
      "error msg",
    );

    debug.mockRestore();
    warn.mockRestore();
    error.mockRestore();
  });

  it("should route log.log() through console.log() with [L] tag", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    process.env.LOG = "*";
    log.options({ tag: "console" }).log("log fallback");
    expect(logSpy).toHaveBeenCalledWith("[L][console]", "log fallback");
    logSpy.mockRestore();
  });
});
