/**
 * Emit a formatted log message at the specified level.
 * Handles filtering, prefix formatting, and routing to the appropriate console method.
 * @param level - The log level
 * @param args - Arguments to log
 * @param options - Optional per-call log options
 * @internal
 */
import type { LogLevel, LogOptions } from '../types/Logger';
import { getCallerTag } from '../utils/getCallerTag.js';
import { matchesScopeFilter } from '../utils/matchesScopeFilter.js';
import { colorForLevel } from '../utils/colorForLevel.js';
import { formatWithReplacements } from '../utils/formatWithReplacements.js';
import { globalLogOptions } from '../core/globalLogOptions.js';

/**
 * Runtime log level. Only logs at or above this level will be emitted (unless LOG/LOG_VERBOSE is set).
 * Can be set at runtime: log.level = 'warn'
 */
const logLevelOrder = ['debug', 'info', 'warn', 'error', 'log', 'silent'] as const;
let runtimeLogLevel: LogLevel | 'silent' = 'debug';

export function setLogLevel(level: LogLevel | 'silent') {
  runtimeLogLevel = level;
}

export function getLogLevel(): LogLevel | 'silent' {
  return runtimeLogLevel;
}

export function emitLog(level: LogLevel, args: unknown[], options?: LogOptions): void {
  // Environment variables for log filtering. Uses process.env if available, otherwise empty object.
  const env = typeof process !== "undefined" && process.env ? process.env : {};
  // Only filter debug logs if LOG/LOG_VERBOSE is set
  const filter = env.LOG || env.LOG_VERBOSE || "";
  // If LOG/LOG_VERBOSE is set, use filtering logic; otherwise, always emit debug logs
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
  } else {
    // Use runtime log level if no LOG/LOG_VERBOSE
    const minLevelIdx = logLevelOrder.indexOf(runtimeLogLevel);
    const msgLevelIdx = logLevelOrder.indexOf(level);
    shouldLog = minLevelIdx !== -1 && msgLevelIdx !== -1 && msgLevelIdx >= minLevelIdx && runtimeLogLevel !== 'silent';
    // For debug, also require DEBUG=1 if runtimeLogLevel is 'debug'
    if (level === 'debug' && runtimeLogLevel === 'debug' && env.DEBUG !== '1') {
      shouldLog = false;
    }
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
  let outArgs = args;
  if (args.length > 0 && typeof args[0] === 'string' && /%[sdifoO]/.test(args[0])) {
    outArgs = formatWithReplacements(args[0] as string, args.slice(1));
  }
  target(color(prefix), ...outArgs);
}
