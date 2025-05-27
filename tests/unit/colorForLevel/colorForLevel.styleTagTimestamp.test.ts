import { describe, it, expect, afterEach } from "vitest";
import { styleTag, styleTimestamp, __setColorEnabled, __setColorLib } from "../../../src/utils/colorForLevels/colorForLevel";

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
  const fakeLibWithStyles = {
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
