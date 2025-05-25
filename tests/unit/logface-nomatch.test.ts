process.env.LOGFACE_NO_EMOJI = '1';

// tests/unit/logface-nomatch.test.ts
// Tests for LOG env with no match, empty, or invalid patterns
import logface from "../../src";
import { vi, describe, it, expect, beforeEach, afterEach, beforeAll } from "vitest";
import { matchFullLogPrefix } from './testLogPrefixHelpers';

describe("LOG env no match, empty, or invalid patterns", () => {
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

  it("should not emit logs if LOG matches nothing", () => {
    process.env.LOG = "nope";
    logface.options({ tag: "auth" }).info("should not log");
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it("should emit all logs if LOG is empty", () => {
    delete process.env.LOG;
    logface.options({ tag: "bar" }).info("should log");
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringMatching(matchFullLogPrefix({ level: 'I', tag: 'bar' })),
      "should log"
    );
  });

  it("should not throw or log for invalid LOG pattern", () => {
    process.env.LOG = "!!!";
    expect(() =>
      logface.options({ tag: "auth" }).info("should not log"),
    ).not.toThrow();
    expect(infoSpy).not.toHaveBeenCalled();
  });
});
