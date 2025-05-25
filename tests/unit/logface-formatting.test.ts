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
    const actual = infoSpy.mock.calls[0][0] as string;
    const regex = matchLogPrefixWithTimestamp('INFO', 'ts');
    // Granular debug output
    // eslint-disable-next-line no-console
    console.log('DEBUG actual:', actual);
    // eslint-disable-next-line no-console
    console.log('DEBUG regex:', regex);
    // eslint-disable-next-line no-console
    console.log('DEBUG actual.length:', actual.length);
    // eslint-disable-next-line no-console
    console.log('DEBUG regex.source:', regex.source);
    // eslint-disable-next-line no-console
    console.log('DEBUG actual char codes:', Array.from(actual).map((c: string) => c.charCodeAt(0)));
    const expectedPrefix = (actual.match(regex)?.[0] || '') as string;
    // eslint-disable-next-line no-console
    console.log('DEBUG expectedPrefix:', expectedPrefix);
    // eslint-disable-next-line no-console
    console.log('DEBUG expectedPrefix.length:', expectedPrefix.length);
    // eslint-disable-next-line no-console
    console.log('DEBUG expectedPrefix char codes:', Array.from(expectedPrefix).map((c: string) => c.charCodeAt(0)));
    expect(actual).toMatch(matchLogPrefixWithTimestamp('INFO', 'ts'));
    expect(infoSpy.mock.calls[0][1]).toBe("combo");
    infoSpy.mockRestore();
  });
});
