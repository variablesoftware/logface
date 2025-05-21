/**
 * Get a color function for a given log level.
 * @param level - The log level
 * @returns A function that colors a string for the given level
 */
import type { LogLevel } from '../types/Logger.js';

// Use a type-safe fallback for chalk
let chalk: {
  gray: (_s: string) => string;
  cyan: (_s: string) => string;
  yellow: (_s: string) => string;
  red: (_s: string) => string;
  white: (_s: string) => string;
} = {
  gray: (_s: string) => _s,
  cyan: (_s: string) => _s,
  yellow: (_s: string) => _s,
  red: (_s: string) => _s,
  white: (_s: string) => _s,
};
(async () => {
  try {
    // Dynamically import chalk for ESM compatibility
    const chalkModule = await import('chalk');
    chalk = chalkModule.default || chalkModule;
  } catch {
    // fallback already set
  }
})();

export function colorForLevel(level: LogLevel) {
  switch (level) {
    case "debug":
      return (_s: string) => chalk.gray(_s);
    case "info":
      return (_s: string) => chalk.cyan(_s);
    case "warn":
      return (_s: string) => chalk.yellow(_s);
    case "error":
      return (_s: string) => chalk.red(_s);
    case "log":
      return (_s: string) => chalk.white(_s);
    default:
      return (_s: string) => _s;
  }
}
