/**
 * Create a logger instance with custom behavior scoped to a given tag or config.
 * @param options - Log options to apply to all methods of the returned logger
 * @returns An object with log methods bound to the provided options
 * @public
 */
import { emitLog, setLogLevel, getLogLevel } from "./emitLog.js";
import type { LogOptions } from "../types/Logger";

export function createLogWithOptions(options: LogOptions) {
  return {
    debug: (...args: unknown[]) => emitLog("debug", args, options),
    info: (...args: unknown[]) => emitLog("info", args, options),
    warn: (...args: unknown[]) => emitLog("warn", args, options),
    error: (...args: unknown[]) => emitLog("error", args, options),
    log: (...args: unknown[]) => emitLog("log", args, options),
    /**
     * Idiomatic setter for global log level (for consistency with log.setLevel)
     */
    setLevel: (level: import("../types/Logger").RuntimeLogLevel) => {
      setLogLevel(level);
    },
    /**
     * Idiomatic getter for global log level
     */
    getLevel: () => {
      return getLogLevel();
    },
  };
}
