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

// This file is now split into smaller, focused test files in tests/unit/.
// Please see:
//   - logface-core.test.ts
//   - logface-levels.test.ts
//   - logface-routing.test.ts
//   - logface-formatting.test.ts
//   - logface-env-edge.test.ts
// You may safely delete this file if all tests pass in the new structure.

import { log } from "../src";
import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
} from "vitest";
import { matchLogPrefix, matchFullLogPrefix } from './unit/helpers/testLogPrefixHelpers';

process.env.LOGFACE_NO_EMOJI = '1';

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

  it("should suppress logs not matching LOG filter", () => {
    process.env.LOG = "auth";
    log.options({ tag: "notauth" }).info("should not log");
    expect(spy).not.toHaveBeenCalled();
  });

  it("should allow logs matching LOG filter", () => {
    process.env.LOG = "match";
    log.options({ tag: "match" }).info("should appear");
    expect(spy).toHaveBeenCalledWith(expect.stringMatching(matchLogPrefix('I', 'match')), "should appear");
  });

  it("should match LOG filter with wildcard auth*", () => {
    process.env.LOG = "auth*";
    log.options({ tag: "authLogin" }).info("matched wildcard");
    expect(spy).toHaveBeenCalledWith(expect.stringMatching(matchLogPrefix('I', 'authLogin')), "matched wildcard");
  });

  it("should match LOG filter with wildcard auth:*", () => {
    process.env.LOG = "auth:*";
    log.options({ tag: "auth:signup" }).info("matched scoped");
    expect(spy).toHaveBeenCalledWith(expect.stringMatching(matchLogPrefix('I', 'auth:signup')), "matched scoped");
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
    expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(matchLogPrefix('L', 'console')), "log fallback");
    logSpy.mockRestore();
  });
});

describe("LOG env edge cases", () => {
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

  it("should allow multiple comma-separated patterns", () => {
    process.env.LOG = "auth,metrics";
    log.options({ tag: "auth" }).info("auth log");
    log.options({ tag: "metrics" }).info("metrics log");
    expect(infoSpy).toHaveBeenCalledWith(expect.stringMatching(matchLogPrefix('I', 'auth')), "auth log");
    expect(infoSpy).toHaveBeenCalledWith(expect.stringMatching(matchLogPrefix('I', 'metrics')), "metrics log");
  });

  it("should only emit logs for the specified level", () => {
    process.env.LOG = "warn";
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    log.info("should not log");
    log.warn("should log");
    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[W]\[[a-z0-9_.-]+]/i),
      "should log",
    );
    warnSpy.mockRestore();
  });

  it("should not emit logs if LOG matches nothing", () => {
    process.env.LOG = "nope";
    log.options({ tag: "auth" }).info("should not log");
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it("should emit all logs if LOG is '*'", () => {
    process.env.LOG = "*";
    log.options({ tag: "foo" }).info("should log");
    expect(infoSpy).toHaveBeenCalledWith(expect.stringMatching(matchLogPrefix('I', 'foo')), "should log");
  });

  it("should emit all logs if LOG is empty", () => {
    delete process.env.LOG;
    log.options({ tag: "bar" }).info("should log");
    expect(infoSpy).toHaveBeenCalledWith(expect.stringMatching(matchLogPrefix('I', 'bar')), "should log");
  });

  it("should not throw or log for invalid LOG pattern", () => {
    process.env.LOG = "!!!";
    expect(() =>
      log.options({ tag: "auth" }).info("should not log"),
    ).not.toThrow();
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it("should respect LOG changes at runtime", () => {
    process.env.LOG = "foo";
    log.options({ tag: "foo" }).info("should log");
    expect(infoSpy).toHaveBeenCalledWith(expect.stringMatching(matchLogPrefix('I', 'foo')), "should log");
    infoSpy.mockClear();
    process.env.LOG = "bar";
    log.options({ tag: "foo" }).info("should not log");
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it("should handle tags with special characters", () => {
    process.env.LOG = "foo:bar-baz_123";
    log.options({ tag: "foo:bar-baz_123" }).info("special tag");
    expect(infoSpy).toHaveBeenCalledWith(expect.stringMatching(matchLogPrefix('I', 'foo:bar-baz_123')), "special tag");
  });

  it("should match both level and tag if LOG contains both", () => {
    process.env.LOG = "info,auth";
    log.options({ tag: "auth" }).info("tag match");
    log.options({ tag: "other" }).info("level match");
    expect(infoSpy).toHaveBeenCalledWith(expect.stringMatching(matchLogPrefix('I', 'auth')), "tag match");
    expect(infoSpy).toHaveBeenCalledWith(expect.stringMatching(matchLogPrefix('I', 'other')), "level match");
  });

  it("should format correctly with timestamp and levelShort false", () => {
    process.env.LOG = "*";
    infoSpy.mockRestore();
    const infoSpy2 = vi.spyOn(console, "info").mockImplementation(() => {});
    log
      .options({ tag: "ts", timestamp: true, levelShort: false })
      .info("combo");
    const actual = infoSpy2.mock.calls[0][0] as string;
    const regex = matchFullLogPrefix({ level: 'INFO', tag: 'ts', timestamp: true });
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
    expect(infoSpy2.mock.calls[0][1]).toBe("combo");
    infoSpy2.mockRestore();
  });
});
