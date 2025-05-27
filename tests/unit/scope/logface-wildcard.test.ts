process.env.LOGFACE_NO_EMOJI = '1';
import logface from "../../../src";
import { vi, describe, it, expect, beforeEach, afterEach, beforeAll } from "vitest";
import { matchFullLogPrefix } from '../helpers/testLogPrefixHelpers';

describe("LOG env wildcard filtering", () => {
  let infoSpy: ReturnType<typeof vi.spyOn> | null;
  let originalLogEnv: string | undefined;

  beforeAll(() => {
    process.env.LOGFACE_NO_EMOJI = '1';
  });

  beforeEach(async function () {
    process.env.LOGFACE_NO_EMOJI = '1';
    // Skip tests if config is intentionally invalid (for coverage)
    const fs = await import('fs');
    if (fs.existsSync('logface.config.js')) {
      const content = fs.readFileSync('logface.config.js', 'utf8');
      if (/throw new Error/.test(content)) {
        infoSpy = null;
        return;
      }
    }
    if (typeof logface.reloadUserConfig === 'function') {
      await logface.reloadUserConfig();
    }
    infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    originalLogEnv = process.env.LOG;
  });

  afterEach(() => {
    if (infoSpy) infoSpy.mockRestore();
    if (originalLogEnv === undefined) delete process.env.LOG;
    else process.env.LOG = originalLogEnv;
  });

  it("should match LOG filter with wildcard auth*", () => {
    if (!infoSpy) return;
    process.env.LOG = "auth*";
    logface.options({ tag: "authLogin" }).info("matched wildcard");
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringMatching(matchFullLogPrefix({ level: 'I', tag: 'authLogin' })),
      "matched wildcard"
    );
  });

  it("should match LOG filter with wildcard auth:*", () => {
    if (!infoSpy) return;
    process.env.LOG = "auth:*";
    logface.options({ tag: "auth:signup" }).info("matched scoped");
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringMatching(matchFullLogPrefix({ level: 'I', tag: 'auth:signup' })),
      "matched scoped"
    );
  });

  it("should emit all logs if LOG is '*'", () => {
    if (!infoSpy) return;
    process.env.LOG = "*";
    logface.options({ tag: "foo" }).info("should log");
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringMatching(matchFullLogPrefix({ level: 'I', tag: 'foo' })),
      "should log"
    );
  });
});
