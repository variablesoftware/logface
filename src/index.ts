/**
 * @variablesoftware/logface 🪵😎
 *
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
 * Usage:
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
 */

/**
 * Valid logging levels that map to native `console` methods.
 */
export type LogLevel = "debug" | "info" | "warn" | "error" | "log";

/**
 * Optional configuration for each log invocation or global setup.
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
 */
let globalLogOptions: LogOptions = {
  levelShort: true,
  timestamp: false,
};

/**
 * Update global logging defaults at runtime.
 * @param options partial overrides for global LogOptions
 */
export function setup(options: Partial<LogOptions>) {
  Object.assign(globalLogOptions, options);
}

/**
 * Attempt to determine the caller file/module name from the stack trace.
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
 * @param scope the tag or level name
 * @param pattern the filter string, supports wildcards
 */
function matchesScopeFilter(scope: string, pattern: string): boolean {
  if (pattern.endsWith("*")) {
    return scope.startsWith(pattern.slice(0, -1));
  } else if (pattern.endsWith(":*")) {
    return scope === pattern.slice(0, -2) || scope.startsWith(pattern.slice(0, -1));
  }
  return scope === pattern;
}

/**
 * Emit a formatted log message at the specified level.
 * Handles filtering, prefix formatting, and routing.
 */
function emitLog(level: LogLevel, args: unknown[], options?: LogOptions) {
  const env = typeof process !== "undefined" ? process.env : {};
  const filter = env.LOG || env.LOG_VERBOSE || "";
  const filters = filter.split(",").map(s => s.trim()).filter(Boolean);

  const effectiveOptions = { ...globalLogOptions, ...options };
  const tag = effectiveOptions.tag || getCallerTag();

  let shouldLog = true;
  if (filters.length > 0) {
    const tagMatch = filters.some(p => matchesScopeFilter(tag, p));
    const levelMatch = filters.some(p => matchesScopeFilter(level, p));
    shouldLog = tagMatch || levelMatch;
  }

  if (!shouldLog) return;

  const ts = effectiveOptions.timestamp ? `[${new Date().toISOString()}] ` : "";
  const lvl = effectiveOptions.levelShort
    ? (level === "log" ? "L" : level[0].toUpperCase())
    : level.toUpperCase();
  const prefix = `${ts}[${lvl}][${tag}]`;

  const target = level === "log" ? console.log : console[level];
  target(prefix, ...args);
}

/**
 * Create a logger instance with custom behavior scoped to a given tag or config.
 */
function createLogWithOptions(options: LogOptions) {
  return {
    debug: (...args: unknown[]) => emitLog("debug", args, options),
    info: (...args: unknown[]) => emitLog("info", args, options),
    warn: (...args: unknown[]) => emitLog("warn", args, options),
    error: (...args: unknown[]) => emitLog("error", args, options),
    log: (...args: unknown[]) => emitLog("log", args, options),
  };
}

/**
 * Default exported logger object.
 * Supports global usage and per-call configuration.
 */
export const log = {
  debug: (...args: unknown[]) => emitLog("debug", args),
  info: (...args: unknown[]) => emitLog("info", args),
  warn: (...args: unknown[]) => emitLog("warn", args),
  error: (...args: unknown[]) => emitLog("error", args),
  log: (...args: unknown[]) => emitLog("log", args),

  /**
   * Create a scoped logger instance with temporary settings.
   * @example log.options({ tag: "auth", timestamp: true }).info("msg")
   */
  options: createLogWithOptions,

  /**
   * @deprecated use log.options({ tag }) instead
   */
  withTag: (tag: string) => createLogWithOptions({ tag }),

  /**
   * Update global default logging behavior.
   */
  setup,
};
