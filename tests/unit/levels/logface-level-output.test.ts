// tests/unit/logface-level-output.test.ts
// Test logface log level output inclusivity and color usage (if chalk is present)
import logface from "../../../src";
import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";

const levels = ["debug", "info", "log", "warn", "error"] as const;

describe("logface log level output", () => {
  let spies: Record<string, ReturnType<typeof vi.spyOn>>;
  let originalLogEnv: string | undefined;

  beforeEach(() => {
    // Patch logface config at runtime for test output consistency
    if (logface && typeof logface.setConfig === "function") {
      logface.setConfig({
        emojiRandom: false,
        emojis: {
          debug: "",
          info: "",
          log: "",
          warn: "",
          error: "",
        },
        colorEnabled: false,
      });
    }
    // Fallback: set environment variables to disable emoji and color
    process.env.LOGFACE_NO_EMOJI = "1";
    process.env.LOGFACE_NO_COLOR = "1";
    spies = {
      debug: vi.spyOn(console, "debug").mockImplementation(() => {}),
      info: vi.spyOn(console, "info").mockImplementation(() => {}),
      log: vi.spyOn(console, "log").mockImplementation(() => {}),
      warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
      error: vi.spyOn(console, "error").mockImplementation(() => {}),
    };
    originalLogEnv = process.env.LOG;
    delete process.env.LOG;
    process.env.DEBUG = "1";
  });

  afterEach(() => {
    Object.values(spies).forEach((spy) => spy.mockRestore());
    if (originalLogEnv === undefined) delete process.env.LOG;
    else process.env.LOG = originalLogEnv;
    delete process.env.DEBUG;
    delete process.env.LOGFACE_NO_EMOJI;
    delete process.env.LOGFACE_NO_COLOR;
    logface.setLogLevel("debug");
  });

  for (const setLevel of levels) {
    it(`should emit correct levels when log.level = '${setLevel}'`, () => {
      logface.setLogLevel(setLevel);
      levels.forEach((emitLevel) => {
        logface(emitLevel, `${emitLevel} message`);
      });
      const idx = levels.indexOf(setLevel);
      levels.forEach((emitLevel, i) => {
        if (i >= idx) {
          expect(spies[emitLevel]).toHaveBeenCalledWith(
            expect.stringMatching(
              new RegExp(`[${emitLevel[0].toUpperCase()}]`),
            ),
            `${emitLevel} message`,
          );
        } else {
          expect(spies[emitLevel]).not.toHaveBeenCalled();
        }
      });
    });
  }
});
