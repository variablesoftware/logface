/**
 * @variablesoftware/logface 🎛️🪵😎
 *
 * @link https://github.com/variablesoftware/logface
 * @link https://www.npmjs.com/package/@variablesoftware/logface
 * @description
 * Structured logger for Node.js and edge runtimes.
 *
 * Features:
 * - Filters messages using `LOG` or `LOG_VERBOSE` environment variables
 * - Supports console-level methods: `debug`, `info`, `warn`, `error`, `log`
 * - Allows tagging, timestamping, and level label customization
 * - Per-call customization via `log.options()`
 * - Wildcard scope matching supported (e.g., `auth*`, `auth:*`)
 * - `withTag()` is deprecated and will be removed in a future release
 *
 * @example
 * ```ts
 * log.debug("Boot sequence initiated");
 * log.info("App started on port %d", 3000);
 * log.warn("Disk usage at %d%%", 91);
 * log.error("Database connection failed: %s", err.message);
 * log.log("Benchmark result: %s", "ok");
 *
 * log.options({ tag: "auth" }).debug("User login event");
 * log.options({ tag: "metrics", timestamp: true }).info("Memory: %dMB", 182);
 * log.options({ tag: "api", levelShort: false }).warn("Rate limit exceeded");
 * log.options({ tag: "console" }).log("bare output ok");
 * ```
 * @license MIT
 */

import type { LogLevel, LogOptions } from "./types/Logger.js";
import { emitLog } from "./core/emitLog.js";
import { createLogWithOptions } from "./core/createLogWithOptions.js";
import { globalLogOptions } from "./core/globalLogOptions.js";
import { setLogLevel, getLogLevel } from "./core/emitLog.js";

/**
 * Update global logging defaults at runtime.
 * @param options - Partial overrides for global LogOptions
 * @public
 */
export function setup(options: Partial<LogOptions>): void {
  Object.assign(globalLogOptions, options);
}

/**
 * Default exported logger object.
 * Supports global usage and per-call configuration.
 * @public
 */
export const log = {
  debug: (...args: unknown[]) => emitLog("debug", args),
  info: (...args: unknown[]) => emitLog("info", args),
  warn: (...args: unknown[]) => emitLog("warn", args),
  error: (...args: unknown[]) => emitLog("error", args),
  log: (...args: unknown[]) => emitLog("log", args),
  options: createLogWithOptions,
  /**
   * @deprecated Use log.options({ tag }) instead.
   */
  withTag: (tag: string) => createLogWithOptions({ tag }),
  setup,
  /**
   * Runtime log level. Only logs at or above this level will be emitted (unless LOG/LOG_VERBOSE is set).
   * Can be set at runtime: log.level = 'warn'
   */
  get level() { return getLogLevel(); },
  set level(l) { setLogLevel(l); },
  setLogLevel,
  getLogLevel,
};

interface LogfaceHybrid {
  (level: LogLevel, ...args: unknown[]): void;
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  log: (...args: unknown[]) => void;
  options: typeof createLogWithOptions;
  withTag: (tag: string) => ReturnType<typeof createLogWithOptions>;
  setup: typeof setup;
  level: LogLevel | 'silent';
  setLogLevel: typeof setLogLevel;
  getLogLevel: typeof getLogLevel;
}

const logface: LogfaceHybrid = function(level: LogLevel, ...args: unknown[]) {
  emitLog(level, args);
} as LogfaceHybrid;

['debug', 'info', 'warn', 'error', 'log'].forEach((level) => {
  (logface as any)[level] = (...args: unknown[]) => emitLog(level as LogLevel, args);
});
logface.options = createLogWithOptions;
logface.withTag = (tag: string) => createLogWithOptions({ tag });
logface.setup = setup;
Object.defineProperty(logface, 'level', {
  get: getLogLevel,
  set: setLogLevel,
});
logface.setLogLevel = setLogLevel;
logface.getLogLevel = getLogLevel;

export default logface;
export { logface };

export type { Logger } from "./types/Logger.js";
