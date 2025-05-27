import { describe, it, expect } from "vitest";
import { __test_internals } from "../../../src/utils/colorForLevels/colorForLevel";

describe("getEmoji edge cases", () => {
  it("returns empty string for unknown level and no userEmojis", () => {
    expect(__test_internals.getEmoji("notalevel")).toBe("");
  });
});
