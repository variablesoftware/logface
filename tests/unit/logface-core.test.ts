// tests/unit/logface-core.test.ts
// Core logface API and formatting tests
import logface from "../../src";
import { vi, describe, it, expect, beforeEach, afterEach, beforeAll } from "vitest";
import { testIdVars } from '../../src/core/emitLog';
import { testTagPrefixRegex, escapeRegExp, matchLogPrefix, matchLogPrefixWithTimestamp } from './testLogPrefixHelpers';

describe("logface core", () => {
  let spy: ReturnType<typeof vi.spyOn>;
  let originalLogEnv: string | undefined;

  beforeAll(() => {
    process.env.LOGFACE_NO_EMOJI = '1';
  });

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
    logface("info", "plain info");
    expect(spy.mock.calls[0][0]).toMatch(expect.stringMatching(matchLogPrefix('I', 'unknown')));
    expect(spy.mock.calls[0][1]).toBe("plain info");
  });

  it("should emit tagged log using options()", () => {
    logface.options({ tag: "test" }).info("tagged info");
    expect(spy).toHaveBeenCalledWith(
      expect.stringMatching(matchLogPrefix('I', 'test')),
      "tagged info"
    );
  });

  it("should emit full level label when levelShort is false", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    logface.options({ tag: "long", levelShort: false }).warn("warn label");
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringMatching(matchLogPrefix('WARN', 'long')),
      "warn label"
    );
    warnSpy.mockRestore();
  });

  it("should include timestamp when enabled", () => {
    logface.options({ tag: "ts", timestamp: true }).info("has timestamp");
    expect(spy.mock.calls[0][0]).toMatch(expect.stringMatching(matchLogPrefixWithTimestamp('I', 'ts')));
    expect(spy.mock.calls[0][1]).toBe("has timestamp");
  });

  it("should allow idiomatic log level change via setLevel/getLevel on tagged logger", () => {
    const tagged = logface.options({ tag: "testtag" });
    // Set to 'error' and check
    if (tagged.setLevel) tagged.setLevel("error");
    if (tagged.getLevel) expect(tagged.getLevel()).toBe("error");
    // Restore to 'debug'
    if (tagged.setLevel) tagged.setLevel("debug");
    if (tagged.getLevel) expect(tagged.getLevel()).toBe("debug");
  });
});
