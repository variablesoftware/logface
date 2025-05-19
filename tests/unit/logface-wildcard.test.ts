// tests/unit/logface-wildcard.test.ts
// Tests for LOG env wildcard filtering
import logface from "../../src";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

describe("LOG env wildcard filtering", () => {
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

  it("should match LOG filter with wildcard auth*", () => {
    process.env.LOG = "auth*";
    logface.options({ tag: "authLogin" }).info("matched wildcard");
    expect(infoSpy).toHaveBeenCalledWith("[I][authLogin]", "matched wildcard");
  });

  it("should match LOG filter with wildcard auth:*", () => {
    process.env.LOG = "auth:*";
    logface.options({ tag: "auth:signup" }).info("matched scoped");
    expect(infoSpy).toHaveBeenCalledWith("[I][auth:signup]", "matched scoped");
  });

  it("should emit all logs if LOG is '*'", () => {
    process.env.LOG = "*";
    logface.options({ tag: "foo" }).info("should log");
    expect(infoSpy).toHaveBeenCalledWith("[I][foo]", "should log");
  });
});
