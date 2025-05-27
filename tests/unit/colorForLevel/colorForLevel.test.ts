import { describe, it, expect, afterEach } from "vitest";
import { colorForLevel, styleTag, styleTimestamp, emojiForLevel, __setColorEnabled, __setColorLib, __test_internals } from "../../../src/utils/colorForLevels/colorForLevel";
import type { LogLevel } from "../../../src/types/Logger";

// Helper to create a fake color function with optional chained styles
function makeFakeColorFn(label: string, chained?: Record<string, (s: string) => string>) {
  const fn = (s: string) => `${label}:${s}`;
  if (chained) {
    Object.assign(fn, chained);
  }
  return fn;
}

const fakeLib = {
  gray: makeFakeColorFn("gray"),
  cyan: makeFakeColorFn("cyan"),
  yellow: makeFakeColorFn("yellow", { bold: (s: string) => `yellow:bold:${s}` }),
  red: makeFakeColorFn("red", { bold: (s: string) => `red:bold:${s}` }),
  white: makeFakeColorFn("white"),
  underline: (s: string) => `u:${s}`,
  dim: (s: string) => `d:${s}`,
};

const picoLib = {
  gray: (s: string) => `pico-gray:${s}`,
  cyan: (s: string) => `pico-cyan:${s}`,
  yellow: (s: string) => `pico-yellow:${s}`,
  red: (s: string) => `pico-red:${s}`,
  white: (s: string) => `pico-white:${s}`,
};

describe("colorForLevel", () => {
  const levels: LogLevel[] = ["debug", "info", "warn", "error", "log"];

  it("returns identity function if color is disabled", () => {
    __setColorEnabled(false);
    for (const level of levels) {
      const fn = colorForLevel(level);
      expect(fn("test")).toBe("test");
    }
    __setColorEnabled(true);
  });

  it("returns identity function for unknown level", () => {
    const fn = colorForLevel("custom" as LogLevel);
    expect(fn("test")).toBe("test");
  });

  it("returns a function for each known level", () => {
    for (const level of levels) {
      const fn = colorForLevel(level);
      expect(typeof fn).toBe("function");
      expect(fn("test")).toEqual(expect.any(String));
    }
  });
});

describe("colorForLevel - color library branches", () => {
  const levels: LogLevel[] = ["debug", "info", "warn", "error", "log"];

  // Patch: Use a fakeLibWithStyles for styleTag/styleTimestamp tests
  const fakeLibWithStyles = {
    gray: makeFakeColorFn("gray"),
    cyan: makeFakeColorFn("cyan"),
    yellow: makeFakeColorFn("yellow", { bold: (s: string) => `yellow:bold:${s}` }),
    red: makeFakeColorFn("red", { bold: (s: string) => `red:bold:${s}` }),
    white: makeFakeColorFn("white"),
    underline: (s: string) => `u:${s}`,
    dim: (s: string) => `d:${s}`,
  };

  afterEach(() => {
    __setColorEnabled(true);
    __setColorLib(fakeLibWithStyles, "chalk");
  });

  it("routes to correct color for each level with picocolors", () => {
    // Patch: All methods must return a function, not just a string
    const picoLib = {
      gray: (s: string) => `pico-gray:${s}`,
      cyan: (s: string) => `pico-cyan:${s}`,
      yellow: (s: string) => `pico-yellow:${s}`,
      red: (s: string) => `pico-red:${s}`,
      white: (s: string) => `pico-white:${s}`,
    };
    __setColorLib(picoLib, "picocolors");
    expect(colorForLevel("debug")("x")).toBe("pico-gray:x");
    expect(colorForLevel("info")("x")).toBe("pico-cyan:x");
    expect(colorForLevel("warn")("x")).toBe("pico-yellow:x");
    expect(colorForLevel("error")("x")).toBe("pico-red:x");
    expect(colorForLevel("log")("x")).toBe("pico-white:x");
  });

  it("routes to correct color for each level with fallback lib (chalk)", () => {
    __setColorLib(fakeLibWithStyles, "chalk");
    expect(colorForLevel("debug")("x")).toBe("gray:x");
    expect(colorForLevel("info")("x")).toBe("cyan:x");
    expect(colorForLevel("warn")("x")).toBe("yellow:bold:x");
    expect(colorForLevel("error")("x")).toBe("red:bold:x");
    expect(colorForLevel("log")("x")).toBe("white:x");
  });

  it("returns identity if colorLib is null", () => {
    __setColorLib(null, "");
    for (const level of levels) {
      expect(colorForLevel(level)("x")).toBe("x");
    }
  });

  it("returns identity for unknown colorLibName", () => {
    __setColorLib(fakeLib, "unknown");
    for (const level of levels) {
      expect(colorForLevel(level)("x")).not.toBe("");
    }
  });
});

describe("styleTag", () => {
  it("returns tag unchanged if color is disabled", () => {
    __setColorEnabled(false);
    expect(styleTag("TAG")).toBe("TAG");
    __setColorEnabled(true);
  });
  it("returns tag unchanged if no colorLib", () => {
    __setColorLib(null, "");
    expect(styleTag("TAG")).toBe("TAG");
  });
});

describe("styleTimestamp", () => {
  it("returns timestamp unchanged if color is disabled", () => {
    __setColorEnabled(false);
    expect(styleTimestamp("TS")).toBe("TS");
    __setColorEnabled(true);
  });
  it("returns timestamp unchanged if no colorLib", () => {
    __setColorLib(null, "");
    expect(styleTimestamp("TS")).toBe("TS");
  });
});

describe("styleTag/styleTimestamp color branches", () => {
  // Use fakeLibWithStyles for these tests
  const fakeLibWithStyles = {
    ...fakeLib,
    underline: (s: string) => `u:${s}`,
    dim: (s: string) => `d:${s}`,
  };
  afterEach(() => {
    __setColorEnabled(true);
    __setColorLib(fakeLibWithStyles, "chalk");
  });
  it("styles tag with underline if available", () => {
    __setColorEnabled(true);
    __setColorLib(fakeLibWithStyles, "chalk");
    expect(styleTag("TAG")).toBe("u:TAG");
  });
  it("returns tag if underline not available", () => {
    __setColorLib({}, "chalk");
    expect(styleTag("TAG")).toBe("TAG");
  });
  it("styles timestamp with dim if available", () => {
    __setColorEnabled(true);
    __setColorLib(fakeLibWithStyles, "chalk");
    expect(styleTimestamp("TS")).toBe("d:TS");
  });
  it("returns timestamp if dim not available", () => {
    __setColorLib({}, "chalk");
    expect(styleTimestamp("TS")).toBe("TS");
  });
});

describe("emojiForLevel", () => {
  it("returns empty string if LOGFACE_NO_EMOJI=1", () => {
    process.env.LOGFACE_NO_EMOJI = "1";
    expect(emojiForLevel("info")).toBe("");
    delete process.env.LOGFACE_NO_EMOJI;
  });
  it("returns a string for known levels", () => {
    for (const level of ["debug", "info", "log", "warn", "error"]) {
      expect(typeof emojiForLevel(level)).toBe("string");
    }
  });
  it("returns empty string for unknown level", () => {
    expect(emojiForLevel("custom")).toBe("");
  });
});

// Additional tests for uncovered/edge branches in colorForLevel.ts
describe("colorForLevel internal/edge branches", () => {
  afterEach(() => {
    __setColorEnabled(true);
    __setColorLib(null, null);
  });

  it("returns identity if colorEnabled is false (edge)", () => {
    __setColorEnabled(false);
    const fn = colorForLevel("debug");
    expect(fn("edge")).toBe("edge");
  });

  it("returns identity if colorLib is null (edge)", () => {
    __setColorLib(null, null);
    const fn = colorForLevel("info");
    expect(fn("edge")).toBe("edge");
  });

  it("returns identity if colorLibName is unknown (edge)", () => {
    __setColorLib({ gray: (s: string) => `gray:${s}` }, "unknown");
    const fn = colorForLevel("debug");
    expect(fn("edge")).toBe("gray:edge"); // fallback to styleWith
  });

  it("returns identity for unknown log level (default branch)", () => {
    __setColorLib(null, null);
    const fn = colorForLevel("notalevel" as any);
    expect(fn("edge")).toBe("edge");
  });
});

describe("getEmoji edge cases", () => {
  it("returns empty string for unknown level and no userEmojis", () => {
    expect(emojiForLevel("notalevel")).toBe("");
  });
});

describe("colorForLevel internal and config branches", () => {
  afterEach(() => {
    __setColorEnabled(true);
    __setColorLib(null, ""); // Fix: pass empty string for name
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
