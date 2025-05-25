// tests/unit/logface-env-edge.test.ts
// Tests for LOG env edge cases and runtime changes
import { log } from "../../src";
import { vi, describe, it, expect, beforeEach, afterEach, beforeAll } from "vitest";
import { testIdVars } from '../../src/core/emitLog';
import { testTagPrefixRegex, escapeRegExp, matchLogPrefix } from './testLogPrefixHelpers';

describe("LOG env edge cases", () => {
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let originalLogEnv: string | undefined;

  beforeAll(() => {
    process.env.LOGFACE_NO_EMOJI = '1';
  });

  beforeEach(() => {
    infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    originalLogEnv = process.env.LOG;
  });

  afterEach(() => {
    infoSpy.mockRestore();
    if (originalLogEnv === undefined) delete process.env.LOG;
    else process.env.LOG = originalLogEnv;
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
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringMatching(matchLogPrefix('I', 'foo')),
      "should log"
    );
    infoSpy.mockClear();
    process.env.LOG = "bar";
    log.options({ tag: "foo" }).info("should not log");
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it("should handle tags with special characters", () => {
    process.env.LOG = "foo:bar-baz_123";
    log.options({ tag: "foo:bar-baz_123" }).info("special tag");
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringMatching(matchLogPrefix('I', 'foo:bar-baz_123')),
      "special tag"
    );
  });

  it("should match both level and tag if LOG contains both", () => {
    process.env.LOG = "info,auth";
    log.options({ tag: "auth" }).info("tag match");
    log.options({ tag: "other" }).info("level match");
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringMatching(matchLogPrefix('I', 'auth')),
      "tag match"
    );
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringMatching(matchLogPrefix('I', 'other')),
      "level match"
    );
  });
});
