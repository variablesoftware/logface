// tests/unit/logface-formatting.test.ts
// Tests for formatting options: timestamp, levelShort, and tag
import logface from "../../src";
import { vi, describe, it, expect } from "vitest";
import { matchLogPrefix, matchLogPrefixWithTimestamp } from './testLogPrefixHelpers';

describe("logface formatting options", () => {
  it("should format correctly with timestamp and levelShort false", () => {
    process.env.LOG = "*";
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    logface
      .options({ tag: "ts", timestamp: true, levelShort: false })
      .info("combo");
    expect(infoSpy.mock.calls[0][0]).toMatch(matchLogPrefixWithTimestamp('INFO', 'ts'));
    expect(infoSpy.mock.calls[0][1]).toBe("combo");
    infoSpy.mockRestore();
  });
});
