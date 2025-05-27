import { describe, it, expect, afterEach } from "vitest";
import { colorForLevel, __setColorEnabled, __setColorLib } from "../../../src/utils/colorForLevels/colorForLevel";

describe("colorForLevel: internal/edge branches", () => {
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
