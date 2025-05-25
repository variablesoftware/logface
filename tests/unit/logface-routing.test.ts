process.env.LOGFACE_NO_EMOJI = '1';
// tests/unit/logface-routing.test.ts
// Tests for correct routing to console methods and log level support
import logface from "../../src";
import { vi, describe, it, expect, beforeAll, afterAll } from "vitest";
import { matchFullLogPrefix } from './testLogPrefixHelpers';

beforeAll(() => {
  process.env._DEBUG_OLD = process.env.DEBUG;
  process.env.DEBUG = "1";
});
afterAll(() => {
  if (process.env._DEBUG_OLD !== undefined) {
    process.env.DEBUG = process.env._DEBUG_OLD;
    delete process.env._DEBUG_OLD;
  } else {
    delete process.env.DEBUG;
  }
});

describe("logface routing and log levels", () => {
  it("should support all base log levels", () => {
    const debug = vi.spyOn(console, "debug").mockImplementation(() => {});
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    logface("debug", "debug msg");
    logface("warn", "warn msg");
    logface("error", "error msg");

    expect(debug).toHaveBeenCalledWith(
      expect.stringMatching(matchFullLogPrefix({ level: 'D', tag: expect.any(String) })),
      "debug msg",
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringMatching(matchFullLogPrefix({ level: 'W', tag: expect.any(String) })),
      "warn msg",
    );
    expect(error).toHaveBeenCalledWith(
      expect.stringMatching(matchFullLogPrefix({ level: 'E', tag: expect.any(String) })),
      "error msg",
    );

    debug.mockRestore();
    warn.mockRestore();
    error.mockRestore();
  });

  it("should route log.log() through console.log() with [L] tag", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    process.env.LOG = "*";
    logface.options({ tag: "console" }).log("log fallback");
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringMatching(matchFullLogPrefix({ level: 'L', tag: 'console' })),
      "log fallback"
    );
    logSpy.mockRestore();
  });
});
