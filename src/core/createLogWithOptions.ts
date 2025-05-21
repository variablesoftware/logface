/**
 * Create a logger instance with custom behavior scoped to a given tag or config.
 * @param options - Log options to apply to all methods of the returned logger
 * @returns An object with log methods bound to the provided options
 * @public
 */
import { emitLog } from './emitLog.js';
import type { LogOptions } from '../types/Logger';

export function createLogWithOptions(options: LogOptions) {
  return {
    debug: (...args: unknown[]) => emitLog("debug", args, options),
    info: (...args: unknown[]) => emitLog("info", args, options),
    warn: (...args: unknown[]) => emitLog("warn", args, options),
    error: (...args: unknown[]) => emitLog("error", args, options),
    log: (...args: unknown[]) => emitLog("log", args, options),
  };
}
