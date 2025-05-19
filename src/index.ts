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

// Optional chalk require for color support (no dynamic import)
let chalk: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  chalk = require('chalk');
} catch (e) {
  chalk = {
    gray: (s: string) => s,
    cyan: (s: string) => s,
    yellow: (s: string) => s,
    red: (s: string) => s,
    white: (s: string) => s,
  };
}

/**
 * Valid logging levels that map to native `console` methods.
 * @public
 */
export type LogLevel = "debug" | "info" | "warn" | "error" | "log";
/**
 * Optional configuration for each log invocation or global setup.
 * @public
 */
interface LogOptions {
  /** Tag to display in `[TAG]` scope brackets */
  tag?: string;
  /** Include ISO 8601 UTC timestamp prefix */
  timestamp?: boolean;
  /** Use short form `[D]`, `[I]`, etc. for levels */
  levelShort?: boolean;
}

/**
 * Global log configuration options (used as fallback).
 * @internal
 */
let globalLogOptions: LogOptions = {
  levelShort: true,
  timestamp: false,
};

/**
 * Update global logging defaults at runtime.
 * @param options - Partial overrides for global LogOptions
 * @public
 */
export function setup(options: Partial<LogOptions>): void {
  Object.assign(globalLogOptions, options);
}

/**
 * Attempt to determine the caller file/module name from the stack trace.
 * Used for automatic tag inference if no tag is provided.
 * @returns The inferred caller tag or "unknown"
 * @internal
 */
function getCallerTag(): string {
  const stack = new Error().stack;
  if (!stack) return "unknown";
  const lines = stack.split("\n").slice(2);
  for (const line of lines) {
    if (!line.includes("logface")) {
      const match = line.match(/at .*?[/\\]([^/\\]+?):\d+:\d+/);
      if (match) return match[1].replace(/\.[tj]s$/, "");
    }
  }
  return "unknown";
}

/**
 * Match a scope or level against a user-defined LOG pattern.
 * Supports wildcards such as `auth*` and `auth:*`.
 * @param scope - The tag or level name
 * @param pattern - The filter string, supports wildcards
 * @returns True if the scope matches the pattern
 * @internal
 */
function matchesScopeFilter(scope: string, pattern: string): boolean {
  if (pattern.endsWith("*")) {
    return scope.startsWith(pattern.slice(0, -1));
  } else if (pattern.endsWith(":*")) {
    return (
      scope === pattern.slice(0, -2) || scope.startsWith(pattern.slice(0, -1))
    );
  }
  return scope === pattern;
}

function colorForLevel(level: LogLevel): (msg: string) => string {
  switch (level) {
    case 'debug': return chalk.gray;
    case 'info': return chalk.cyan;
    case 'warn': return chalk.yellow;
    case 'error': return chalk.red;
    case 'log': return chalk.white;
    default: return chalk.white;
  }
}

/**
 * Emit a formatted log message at the specified level.
 * Handles filtering, prefix formatting, and routing to the appropriate console method.
 * @param level - The log level
 * @param args - Arguments to log
 * @param options - Optional per-call log options
 * @internal
 */
function emitLog(level: LogLevel, args: unknown[], options?: LogOptions): void {
  // Use typeof check for process to support edge runtimes
  const env = typeof process !== "undefined" && process.env ? process.env : {};
  const filter = env.LOG || env.LOG_VERBOSE || "";
  const filters = filter
    .split(",")
    .map((s: string) => s.trim())
    .filter((s: string) => Boolean(s));

  const effectiveOptions = { ...globalLogOptions, ...options };
  const tag = effectiveOptions.tag || getCallerTag();

  let shouldLog = true;
  if (filters.length > 0) {
    const tagMatch = filters.some((p: string) => matchesScopeFilter(tag, p));
    const levelMatch = filters.some((p: string) => matchesScopeFilter(level, p));
    shouldLog = tagMatch || levelMatch;
  }

  if (!shouldLog) return;

  const ts = effectiveOptions.timestamp ? `[${new Date().toISOString()}] ` : "";
  const lvl = effectiveOptions.levelShort
    ? level === "log"
      ? "L"
      : level[0].toUpperCase()
    : level.toUpperCase();
  const prefix = `${ts}[${lvl}][${tag}]`;
  const color = colorForLevel(level);
  const target = level === "log" ? console.log : console[level];
  target(color(prefix), ...args);
}

/**
 * Create a logger instance with custom behavior scoped to a given tag or config.
 * @param options - Log options to apply to all methods of the returned logger
 * @returns An object with log methods bound to the provided options
 * @public
 */
function createLogWithOptions(options: LogOptions) {
  return {
    /**
     * Log a debug message with the provided options.
     */
    debug: (...args: unknown[]) => emitLog("debug", args, options),
    /**
     * Log an info message with the provided options.
     */
    info: (...args: unknown[]) => emitLog("info", args, options),
    /**
     * Log a warning message with the provided options.
     */
    warn: (...args: unknown[]) => emitLog("warn", args, options),
    /**
     * Log an error message with the provided options.
     */
    error: (...args: unknown[]) => emitLog("error", args, options),
    /**
     * Log a generic message with the provided options.
     */
    log: (...args: unknown[]) => emitLog("log", args, options),
  };
}

/**
 * Default exported logger object.
 * Supports global usage and per-call configuration.
 * @public
 */
export const log = {
  /**
   * Log a debug message.
   * @param args - Arguments to log
   */
  debug: (...args: unknown[]) => emitLog("debug", args),
  /**
   * Log an info message.
   * @param args - Arguments to log
   */
  info: (...args: unknown[]) => emitLog("info", args),
  /**
   * Log a warning message.
   * @param args - Arguments to log
   */
  warn: (...args: unknown[]) => emitLog("warn", args),
  /**
   * Log an error message.
   * @param args - Arguments to log
   */
  error: (...args: unknown[]) => emitLog("error", args),
  /**
   * Log a generic message.
   * @param args - Arguments to log
   */
  log: (...args: unknown[]) => emitLog("log", args),

  /**
   * Create a scoped logger instance with temporary settings.
   * @example
   * log.options({ tag: "auth", timestamp: true }).info("msg")
   * @param options - Log options to apply to the returned logger
   * @returns A logger instance with the specified options
   */
  options: createLogWithOptions,

  /**
   * @deprecated Use log.options({ tag }) instead.
   * @param tag - Tag to scope the logger
   * @returns A logger instance scoped to the provided tag
   */
  withTag: (tag: string) => createLogWithOptions({ tag }),

  /**
   * Update global default logging behavior.
   * @param options - Partial overrides for global LogOptions
   */
  setup,
};

// Hybrid callable+object export
function logface(level: LogLevel, ...args: unknown[]) {
  emitLog(level, args);
}

['debug', 'info', 'warn', 'error', 'log'].forEach((level) => {
  (logface as any)[level] = (...args: unknown[]) => emitLog(level as LogLevel, args);
});

logface.options = createLogWithOptions;
logface.withTag = (tag: string) => createLogWithOptions({ tag });
logface.setup = setup;

export default logface;
export { logface };

export type { Logger } from "./types/Logger";
