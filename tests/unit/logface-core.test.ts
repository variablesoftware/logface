// tests/unit/logface-core.test.ts
// Core logface API and formatting tests
import { log } from "../../src";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

describe("logface core", () => {
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

  it("should emit plain log with default tag", () => {
    log.info("plain info");
    expect(spy.mock.calls[0][0]).toMatch(/\[I]\[[a-z0-9_.-]+]/i);
    expect(spy.mock.calls[0][1]).toBe("plain info");
  });

  it("should emit tagged log using options()", () => {
    log.options({ tag: "test" }).info("tagged info");
    expect(spy).toHaveBeenCalledWith("[I][test]", "tagged info");
  });

  it("should emit full level label when levelShort is false", () => {
    spy.mockRestore();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    log.options({ tag: "long", levelShort: false }).warn("warn label");
    expect(warnSpy).toHaveBeenCalledWith("[WARN][long]", "warn label");
    warnSpy.mockRestore();
  });

  it("should include timestamp when enabled", () => {
    log.options({ tag: "ts", timestamp: true }).info("has timestamp");
    expect(spy.mock.calls[0][0]).toMatch(/^\[\d{4}-\d{2}-\d{2}T.*Z] \[I]\[ts]/);
    expect(spy.mock.calls[0][1]).toBe("has timestamp");
  });
});
