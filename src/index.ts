/**
 * Structured logger for Node.js and edge runtimes.
 *
 * - Filters messages using LOG or LOG_VERBOSE env vars
 * - Supports console-level logging: debug, info, warn, error
 * - Allows tagging via `log.withTag("tag")`
 *
 * Usage:
 * ```ts
 * log.info("hello");
 * log.withTag("auth").debug("login attempt");
 * ```
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Emits a log message if the LOG/LOG_VERBOSE filter matches the tag or level.
 *
 * @param tag - Logical category for the log line
 * @param level - Console method to use
 * @param message - Message string
 */
export function logMsg(tag: string, level: LogLevel, message: string) {
  const env = typeof process !== "undefined" ? process.env : {};
  const filter = env.LOG || env.LOG_VERBOSE || "";
  const parts = filter.split(",").map((s: string) => s.trim());
  const tagMatch = parts.some((p: string) => tag.includes(p));
  const levelMatch = parts.some((p: string) => level.startsWith(p));

  // Emit only if no filter or if tag/level matches
  if (!filter || tagMatch || levelMatch) {
    const prefix = `[${level.toUpperCase()}][${tag}]`;
    console[level](prefix, message);
  }
}

/**
 * Global log facade with shortcut methods and tag support.
 */
export const log = {
  // Unscoped logs with default "global" tag
  debug: (...args: unknown[]) =>
    logMsg("global", "debug", args.map(String).join(" ")),
  log: (...args: unknown[]) =>
    logMsg("global", "info", args.map(String).join(" ")),
  info: (...args: unknown[]) =>
    logMsg("global", "info", args.map(String).join(" ")),
  warn: (...args: unknown[]) =>
    logMsg("global", "warn", args.map(String).join(" ")),
  error: (...args: unknown[]) =>
    logMsg("global", "error", args.map(String).join(" ")),

  // Scoped logger with static tag
  withTag: (tag: string) => ({
    debug: (...args: unknown[]) =>
      logMsg(tag, "debug", args.map(String).join(" ")),
    log: (...args: unknown[]) =>
      logMsg(tag, "info", args.map(String).join(" ")),
    info: (...args: unknown[]) =>
      logMsg(tag, "info", args.map(String).join(" ")),
    warn: (...args: unknown[]) =>
      logMsg(tag, "warn", args.map(String).join(" ")),
    error: (...args: unknown[]) =>
      logMsg(tag, "error", args.map(String).join(" ")),
  }),
};
