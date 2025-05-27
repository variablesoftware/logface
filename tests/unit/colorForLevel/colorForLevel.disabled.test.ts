import { describe, it, expect, afterEach } from "vitest";
import { colorForLevel, __setColorEnabled, __setColorLib } from "../../../src/utils/colorForLevels/colorForLevel";
import type { LogLevel } from "../../../src/types/Logger";

const levels: LogLevel[] = ["debug", "info", "warn", "error", "log"];

describe("colorForLevel: disables and unknowns", () => {
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
