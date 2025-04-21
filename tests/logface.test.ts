import { describe, it, expect, vi } from "vitest";
import { log, logMsg } from "../src";

describe("logface", () => {
  it("logMsg() should call console with the correct level", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    logMsg("test", "info", "Hello logface");
    expect(spy).toHaveBeenCalledWith("[INFO][test]", "Hello logface");
    spy.mockRestore();
  });

  it("log.withTag() should prefix logs with tag", () => {
    const spy = vi.spyOn(console, "debug").mockImplementation(() => {});
    const tagged = log.withTag("mock");
    tagged.debug("debugging");
    expect(spy).toHaveBeenCalledWith("[DEBUG][mock]", "debugging");
    spy.mockRestore();
  });
});
