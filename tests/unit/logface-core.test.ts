// tests/unit/logface-core.test.ts
// Core logface API and formatting tests
import logface from "../../src";
import { vi, describe, it, expect, beforeEach, afterEach, beforeAll } from "vitest";
import { matchLogPrefix, matchFullLogPrefix } from './testLogPrefixHelpers';

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
    const actual = spy.mock.calls[0][0] as string;
    const regex = matchFullLogPrefix({ level: 'I', tag: 'unknown' });
    // Granular debug output
    console.log('DEBUG actual:', actual);
    console.log('DEBUG regex:', regex);
    console.log('DEBUG actual.length:', actual.length);
    console.log('DEBUG regex.source:', regex.source);
    console.log('DEBUG actual char codes:', Array.from(actual).map((c: string) => c.charCodeAt(0)));
    const expectedPrefix = (actual.match(regex)?.[0] || '') as string;
    console.log('DEBUG expectedPrefix:', expectedPrefix);
    console.log('DEBUG expectedPrefix.length:', expectedPrefix.length);
    console.log('DEBUG expectedPrefix char codes:', Array.from(expectedPrefix).map((c: string) => c.charCodeAt(0)));
    expect(actual).toMatch(regex);
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
    const actual = spy.mock.calls[0][0] as string;
    const regex = matchFullLogPrefix({ level: 'I', tag: 'ts', timestamp: true });
    // Granular debug output
    console.log('DEBUG actual:', actual);
    console.log('DEBUG regex:', regex);
    console.log('DEBUG actual.length:', actual.length);
    console.log('DEBUG regex.source:', regex.source);
    console.log('DEBUG actual char codes:', Array.from(actual).map((c: string) => c.charCodeAt(0)));
    const expectedPrefix = (actual.match(regex)?.[0] || '') as string;
    console.log('DEBUG expectedPrefix:', expectedPrefix);
    console.log('DEBUG expectedPrefix.length:', expectedPrefix.length);
    console.log('DEBUG expectedPrefix char codes:', Array.from(expectedPrefix).map((c: string) => c.charCodeAt(0)));
    expect(actual).toMatch(regex);
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
