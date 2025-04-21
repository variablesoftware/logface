/**
 * Structured logger with console-like API and filtering via LOG env var.
 */

type LogLevel = "debug" | "info" | "warn" | "error";
const LOG_LEVELS = ["debug", "info", "warn", "error"];

export function logMsg(tag: string, level: LogLevel, message: string) {
  const env = typeof process !== "undefined" ? process.env : {};
  const filter = env.LOG || env.LOG_VERBOSE || "";
  const parts = filter.split(",").map((s) => s.trim());
  const tagMatch = parts.some((p) => tag.includes(p));
  const levelMatch = parts.some((p) => level.startsWith(p));

  if (!filter || tagMatch || levelMatch) {
    const prefix = `[${level.toUpperCase()}][${tag}]`;
    console[level](prefix, message);
  }
}

export const log = {
  debug: (...args: any[]) => logMsg("global", "debug", args.map(String).join(" ")),
  log: (...args: any[]) => logMsg("global", "info", args.map(String).join(" ")),
  info: (...args: any[]) => logMsg("global", "info", args.map(String).join(" ")),
  warn: (...args: any[]) => logMsg("global", "warn", args.map(String).join(" ")),
  error: (...args: any[]) => logMsg("global", "error", args.map(String).join(" ")),
  withTag: (tag: string) => ({
    debug: (...args: any[]) => logMsg(tag, "debug", args.map(String).join(" ")),
    log: (...args: any[]) => logMsg(tag, "info", args.map(String).join(" ")),
    info: (...args: any[]) => logMsg(tag, "info", args.map(String).join(" ")),
    warn: (...args: any[]) => logMsg(tag, "warn", args.map(String).join(" ")),
    error: (...args: any[]) => logMsg(tag, "error", args.map(String).join(" ")),
  }),
};