import { describe, it, expect, afterEach } from "vitest";
import { colorForLevel, __setColorLib } from "../../../src/utils/colorForLevels/colorForLevel";
import type { LogLevel } from "../../../src/types/Logger";

const levels: LogLevel[] = ["debug", "info", "warn", "error", "log"];

const fakeLib = {
  gray: (s: string) => `gray:${s}`,
  cyan: (s: string) => `cyan:${s}`,
  yellow: (s: string) => `yellow:bold:${s}`,
  red: (s: string) => `red:bold:${s}`,
  white: (s: string) => `white:${s}`,
};
const picoLib = {
  gray: (s: string) => `pico-gray:${s}`,
  cyan: (s: string) => `pico-cyan:${s}`,
  yellow: (s: string) => `pico-yellow:${s}`,
  red: (s: string) => `pico-red:${s}`,
  white: (s: string) => `pico-white:${s}`,
};

describe("colorForLevel: color library branches", () => {
  afterEach(() => {
    __setColorLib(fakeLib, "chalk");
  });

  it("routes to correct color for each level with picocolors", () => {
    __setColorLib(picoLib, "picocolors");
    expect(colorForLevel("debug")("x")).toBe("pico-gray:x");
    expect(colorForLevel("info")("x")).toBe("pico-cyan:x");
    expect(colorForLevel("warn")("x")).toBe("pico-yellow:x");
    expect(colorForLevel("error")("x")).toBe("pico-red:x");
    expect(colorForLevel("log")("x")).toBe("pico-white:x");
  });

  it("routes to correct color for each level with fallback lib (chalk)", () => {
    __setColorLib(fakeLib, "chalk");
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
