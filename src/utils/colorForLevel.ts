/**
 * Get a color function for a given log level.
 * @param level - The log level
 * @returns A function that colors a string for the given level
 */
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
import type { LogLevel } from '../types/Logger.js';
export function colorForLevel(level: LogLevel): (msg: string) => string {
  switch (level) {
    case 'debug': return chalk.gray;
    case 'info': return chalk.cyan;
    case 'warn': return chalk.yellow;
    case 'error': return chalk.red;
    case 'log': return chalk.white;
    default: return chalk.white;
  }
}
