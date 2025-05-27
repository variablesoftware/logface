process.env.LOGFACE_NO_EMOJI = '1';

// tests/unit/logface-runtimechange.test.ts
// Tests for LOG env changes at runtime
import logface from "../../../src";
import { vi, describe, it, expect, beforeEach, afterEach, beforeAll } from "vitest";
import { matchLogPrefix } from '../helpers/testLogPrefixHelpers';

beforeAll(() => {
  process.env.LOGFACE_NO_EMOJI = '1';
});

describe("LOG env runtime changes", () => {
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

  it("should respect LOG changes at runtime", () => {
    process.env.LOG = "foo";
    logface.options({ tag: "foo" }).info("should log");
    expect(infoSpy).toHaveBeenCalledWith(expect.stringMatching(matchLogPrefix('I', 'foo')), "should log");
    infoSpy.mockClear();
    process.env.LOG = "bar";
    logface.options({ tag: "foo" }).info("should not log");
    expect(infoSpy).not.toHaveBeenCalled();
  });
});
