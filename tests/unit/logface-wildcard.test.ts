process.env.LOGFACE_NO_EMOJI = '1';
import logface from "../../src";
import { vi, describe, it, expect, beforeEach, afterEach, beforeAll } from "vitest";
import { matchFullLogPrefix } from './testLogPrefixHelpers';

describe("LOG env wildcard filtering", () => {
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let originalLogEnv: string | undefined;

  beforeAll(() => {
    process.env.LOGFACE_NO_EMOJI = '1';
  });

  beforeEach(async () => {
    process.env.LOGFACE_NO_EMOJI = '1';
    if (typeof logface.reloadUserConfig === 'function') {
      await logface.reloadUserConfig();
    }
    infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    originalLogEnv = process.env.LOG;
  });

  afterEach(() => {
    infoSpy.mockRestore();
    if (originalLogEnv === undefined) delete process.env.LOG;
    else process.env.LOG = originalLogEnv;
  });

  it("should match LOG filter with wildcard auth*", () => {
    process.env.LOG = "auth*";
    logface.options({ tag: "authLogin" }).info("matched wildcard");
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringMatching(matchFullLogPrefix({ level: 'I', tag: 'authLogin' })),
      "matched wildcard"
    );
  });

  it("should match LOG filter with wildcard auth:*", () => {
    process.env.LOG = "auth:*";
    logface.options({ tag: "auth:signup" }).info("matched scoped");
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringMatching(matchFullLogPrefix({ level: 'I', tag: 'auth:signup' })),
      "matched scoped"
    );
  });

  it("should emit all logs if LOG is '*'", () => {
    process.env.LOG = "*";
    logface.options({ tag: "foo" }).info("should log");
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringMatching(matchFullLogPrefix({ level: 'I', tag: 'foo' })),
      "should log"
    );
  });
});
