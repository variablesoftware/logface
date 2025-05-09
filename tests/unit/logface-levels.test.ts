// tests/unit/logface-levels.test.ts
// Tests for log level filtering and LOG env variable edge cases
// This file's tests have been split into smaller, focused files:
//   - logface-wildcard.test.ts
//   - logface-multimatch.test.ts
//   - logface-levelonly.test.ts
//   - logface-nomatch.test.ts
//   - logface-runtimechange.test.ts
//   - logface-suppress.test.ts
// You may safely delete this file if all tests pass in the new structure.
import { log } from "../../src";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

describe("LOG env filtering and log levels", () => {
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

  it("should suppress logs not matching LOG filter", () => {
    process.env.LOG = "auth";
    log.options({ tag: "notauth" }).info("should not log");
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it("should allow logs matching LOG filter", () => {
    process.env.LOG = "match";
    log.options({ tag: "match" }).info("should appear");
    expect(infoSpy).toHaveBeenCalledWith("[I][match]", "should appear");
  });

  it("should match LOG filter with wildcard auth*", () => {
    process.env.LOG = "auth*";
    log.options({ tag: "authLogin" }).info("matched wildcard");
    expect(infoSpy).toHaveBeenCalledWith("[I][authLogin]", "matched wildcard");
  });

  it("should match LOG filter with wildcard auth:*", () => {
    process.env.LOG = "auth:*";
    log.options({ tag: "auth:signup" }).info("matched scoped");
    expect(infoSpy).toHaveBeenCalledWith("[I][auth:signup]", "matched scoped");
  });

  it("should not match unrelated scope", () => {
    process.env.LOG = "metrics";
    log.options({ tag: "auth" }).info("should not match");
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it("should allow multiple comma-separated patterns", () => {
    process.env.LOG = "auth,metrics";
    log.options({ tag: "auth" }).info("auth log");
    log.options({ tag: "metrics" }).info("metrics log");
    expect(infoSpy).toHaveBeenCalledWith("[I][auth]", "auth log");
    expect(infoSpy).toHaveBeenCalledWith("[I][metrics]", "metrics log");
  });

  it("should only emit logs for the specified level", () => {
    process.env.LOG = "warn";
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    log.info("should not log");
    log.warn("should log");
    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[W]\[[a-z0-9_.-]+]/i),
      "should log"
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
    expect(infoSpy).toHaveBeenCalledWith("[I][foo]", "should log");
  });

  it("should emit all logs if LOG is empty", () => {
    delete process.env.LOG;
    log.options({ tag: "bar" }).info("should log");
    expect(infoSpy).toHaveBeenCalledWith("[I][bar]", "should log");
  });

  it("should not throw or log for invalid LOG pattern", () => {
    process.env.LOG = "!!!";
    expect(() => log.options({ tag: "auth" }).info("should not log")).not.toThrow();
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it("should respect LOG changes at runtime", () => {
    process.env.LOG = "foo";
    log.options({ tag: "foo" }).info("should log");
    expect(infoSpy).toHaveBeenCalledWith("[I][foo]", "should log");
    infoSpy.mockClear();
    process.env.LOG = "bar";
    log.options({ tag: "foo" }).info("should not log");
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it("should handle tags with special characters", () => {
    process.env.LOG = "foo:bar-baz_123";
    log.options({ tag: "foo:bar-baz_123" }).info("special tag");
    expect(infoSpy).toHaveBeenCalledWith("[I][foo:bar-baz_123]", "special tag");
  });

  it("should match both level and tag if LOG contains both", () => {
    process.env.LOG = "info,auth";
    log.options({ tag: "auth" }).info("tag match");
    log.options({ tag: "other" }).info("level match");
    expect(infoSpy).toHaveBeenCalledWith("[I][auth]", "tag match");
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[I]\[other]/i),
      "level match"
    );
  });

  it("should format correctly with timestamp and levelShort false", () => {
    process.env.LOG = "*";
    infoSpy.mockRestore();
    const infoSpy2 = vi.spyOn(console, "info").mockImplementation(() => {});
    log.options({ tag: "ts", timestamp: true, levelShort: false }).info("combo");
    expect(infoSpy2.mock.calls[0][0]).toMatch(/^\[\d{4}-\d{2}-\d{2}T.*Z] \[INFO]\[ts]/);
    expect(infoSpy2.mock.calls[0][1]).toBe("combo");
    infoSpy2.mockRestore();
  });
});
