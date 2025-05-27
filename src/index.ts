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
import { loadUserConfig, reloadUserConfig } from './core/globalLogOptions.js';

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
  debug: (..._args: unknown[]) => emitLog("debug", _args),
  info: (..._args: unknown[]) => emitLog("info", _args),
  warn: (..._args: unknown[]) => emitLog("warn", _args),
  error: (..._args: unknown[]) => emitLog("error", _args),
  log: (..._args: unknown[]) => emitLog("log", _args),
  options: createLogWithOptions,
  /**
   * @deprecated Use log.options({ tag }) instead.
   */
    setup,
  /**
   * Runtime log level. Only logs at or above this level will be emitted (unless LOG/LOG_VERBOSE is set).
   * Can be set at runtime: log.level = 'warn'
   */
  get level() {
    return getLogLevel();
  },
  set level(l) {
    setLogLevel(l);
  },
  setLogLevel,
  getLogLevel,
};

interface LogfaceHybrid {
  (_level: LogLevel, ..._args: unknown[]): void;
  debug: (..._args: unknown[]) => void;
  info: (..._args: unknown[]) => void;
  warn: (..._args: unknown[]) => void;
  error: (..._args: unknown[]) => void;
  log: (..._args: unknown[]) => void;
  options: typeof createLogWithOptions;
    setup: typeof setup;
  level: LogLevel | "silent";
  setLogLevel: typeof setLogLevel;
  getLogLevel: typeof getLogLevel;
  loadUserConfig: typeof import("./core/globalLogOptions.js").loadUserConfig;
  reloadUserConfig: typeof import("./core/globalLogOptions.js").reloadUserConfig;
}

const logface: LogfaceHybrid = function (
  _level: LogLevel,
  ..._args: unknown[]
) {
  emitLog(_level, _args);
} as LogfaceHybrid;

["debug", "info", "warn", "error", "log"].forEach((_level) => {
  (logface as unknown as Record<string, unknown>)[_level] = (
    ..._args: unknown[]
  ) => emitLog(_level as LogLevel, _args);
});
logface.options = createLogWithOptions;
logface.setup = setup;
Object.defineProperty(logface, "level", {
  get: getLogLevel,
  set: setLogLevel,
});
logface.setLogLevel = setLogLevel;
logface.getLogLevel = getLogLevel;
logface.loadUserConfig = loadUserConfig;
logface.reloadUserConfig = reloadUserConfig;

export default logface;
export { logface };

export type { Logger } from "./types/Logger.js";
