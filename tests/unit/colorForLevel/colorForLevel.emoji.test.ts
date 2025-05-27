import { describe, it, expect } from "vitest";
import { emojiForLevel } from "../../../src/utils/colorForLevels/colorForLevel";

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
