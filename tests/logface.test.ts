/**
 * @file logface.test.ts
 *
 * Test suite for @variablesoftware/logface 🪵😎 structured logging module.
 *
 * These tests verify correct emission of log output across all supported log levels,
 * including scope-tagging, timestamp formatting, log filtering via the LOG environment variable,
 * and wildcard pattern matching (e.g. auth*, auth:*). The suite also ensures proper routing
 * through the corresponding console methods and validates the integrity of per-call `options()` overrides.
 *
 * Notably, log.log() is not an alias for log.info(); instead, it routes explicitly to console.log(),
 * and emits [L][scope] as its prefix.
 */

import { log } from "../src";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

describe("logface", () => {
  let spy: ReturnType<typeof vi.spyOn>;
  let originalLogEnv: string | undefined;

  beforeEach(() => {
    spy = vi.spyOn(console, "info").mockImplementation(() => {});
    originalLogEnv = process.env.LOG;
  });

  afterEach(() => {
    spy.mockRestore();
    if (originalLogEnv === undefined) delete process.env.LOG;
    else process.env.LOG = originalLogEnv;
  });

  it("should emit plain log with default tag", () => {
    log.info("plain info");
    expect(spy.mock.calls[0][0]).toMatch(/\[I]\[[a-z0-9_.-]+]/i);
    expect(spy.mock.calls[0][1]).toBe("plain info");
  });

  it("should emit tagged log using options()", () => {
    log.options({ tag: "test" }).info("tagged info");
    expect(spy).toHaveBeenCalledWith("[I][test]", "tagged info");
  });

  it("should emit full level label when levelShort is false", () => {
    spy.mockRestore();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    log.options({ tag: "long", levelShort: false }).warn("warn label");
    expect(warnSpy).toHaveBeenCalledWith("[WARN][long]", "warn label");
    warnSpy.mockRestore();
  });

  it("should include timestamp when enabled", () => {
    log.options({ tag: "ts", timestamp: true }).info("has timestamp");
    expect(spy.mock.calls[0][0]).toMatch(/^\[\d{4}-\d{2}-\d{2}T.*Z] \[I]\[ts]/);
    expect(spy.mock.calls[0][1]).toBe("has timestamp");
  });

  it("should suppress logs not matching LOG filter", () => {
    process.env.LOG = "auth";
    log.options({ tag: "notauth" }).info("should not log");
    expect(spy).not.toHaveBeenCalled();
  });

  it("should allow logs matching LOG filter", () => {
    process.env.LOG = "match";
    log.options({ tag: "match" }).info("should appear");
    expect(spy).toHaveBeenCalledWith("[I][match]", "should appear");
  });

  it("should match LOG filter with wildcard auth*", () => {
    process.env.LOG = "auth*";
    log.options({ tag: "authLogin" }).info("matched wildcard");
    expect(spy).toHaveBeenCalledWith("[I][authLogin]", "matched wildcard");
  });

  it("should match LOG filter with wildcard auth:*", () => {
    process.env.LOG = "auth:*";
    log.options({ tag: "auth:signup" }).info("matched scoped");
    expect(spy).toHaveBeenCalledWith("[I][auth:signup]", "matched scoped");
  });

  it("should not match unrelated scope", () => {
    process.env.LOG = "metrics";
    log.options({ tag: "auth" }).info("should not match");
    expect(spy).not.toHaveBeenCalled();
  });

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
