import { describe, it, expect, afterEach } from "vitest";
import { __test_internals, __setColorEnabled, __setColorLib } from "../../../src/utils/colorForLevels/colorForLevel";

describe("colorForLevel internals and config", () => {
  afterEach(() => {
    __setColorEnabled(true);
    __setColorLib(null, "");
    __test_internals.setUserEmojis({});
    delete process.env.LOGFACE_NO_EMOJI;
  });

  it("getEmoji returns empty string if LOGFACE_NO_EMOJI=1", () => {
    process.env.LOGFACE_NO_EMOJI = "1";
    expect(__test_internals.getEmoji("debug")).toBe("");
  });

  it("getEmoji returns from userEmojis if set", () => {
    __test_internals.setUserEmojis({ debug: ["ZZZ"] });
    expect(["ZZZ"].includes(__test_internals.getEmoji("debug"))).toBe(true);
  });

  it("getEmoji returns from defaultEmojis for known level", () => {
    __test_internals.setUserEmojis({});
    expect(__test_internals.defaultEmojis.debug.includes(__test_internals.getEmoji("debug"))).toBe(true);
  });

  it("getEmoji returns empty string for unknown level", () => {
    __test_internals.setUserEmojis({});
    expect(__test_internals.getEmoji("notalevel")).toBe("");
  });

  it("getColorLib returns correct library and name", () => {
    __setColorLib({ gray: (s: string) => s }, "chalk");
    const { lib, name } = __test_internals.getColorLib();
    expect(typeof lib?.gray).toBe("function");
    expect(name).toBe("chalk");
  });

  it("styleWith returns identity if method missing or not a function", () => {
    const lib = { notAColor: "nope" };
    const fn = __test_internals.styleWith(lib as any, "notAColor");
    expect(fn("x")).toBe("x");
  });

  it("styleWith applies chained styles if present", () => {
    const bold = (s: string) => `b:${s}`;
    const gray = (s: string) => `g:${s}`;
    (gray as any).bold = bold;
    const lib = { gray };
    const fn = __test_internals.styleWith(lib, "gray", "bold");
    expect(fn("x")).toBe("b:x");
  });
});
