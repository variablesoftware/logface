// tests/unit/logface-multimatch.test.ts
// Tests for LOG env with multiple patterns and special characters
import logface from "../../src";
import { vi, describe, it, expect, beforeEach, afterEach, beforeAll } from "vitest";
import { matchFullLogPrefix } from './testLogPrefixHelpers';

describe("LOG env multi-pattern and special character filtering", () => {
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

  it("should allow multiple comma-separated patterns", () => {
    process.env.LOG = "auth,metrics";
    logface.options({ tag: "auth" }).info("auth log");
    logface.options({ tag: "metrics" }).info("metrics log");
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringMatching(matchFullLogPrefix({ level: 'I', tag: 'auth' })),
      "auth log"
    );
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringMatching(matchFullLogPrefix({ level: 'I', tag: 'metrics' })),
      "metrics log"
    );
  });

  it("should handle tags with special characters", () => {
    process.env.LOG = "foo:bar-baz_123";
    logface.options({ tag: "foo:bar-baz_123" }).info("special tag");
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringMatching(matchFullLogPrefix({ level: 'I', tag: 'foo:bar-baz_123' })),
      "special tag"
    );
  });

  it("should match both level and tag if LOG contains both", () => {
    process.env.LOG = "info,auth";
    logface.options({ tag: "auth" }).info("tag match");
    logface.options({ tag: "other" }).info("level match");
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringMatching(matchFullLogPrefix({ level: 'I', tag: 'auth' })),
      "tag match"
    );
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringMatching(matchFullLogPrefix({ level: 'I', tag: 'other' })),
      "level match"
    );
  });
});
