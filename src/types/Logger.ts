/**
 * Represents a structured logger with standard log level methods.
 *
 * Each method accepts any arguments, similar to the native `console` methods.
 * Implementations may support additional features such as tagging, filtering, or formatting.
 *
 * @public
 */
export type Logger = {
  /**
   * Logs a debug-level message.
   * @param _args - Arguments to log.
   */
  debug: (..._args: unknown[]) => void;

  /**
   * Logs an info-level message.
   * @param _args - Arguments to log.
   */
  info: (..._args: unknown[]) => void;

  /**
   * Logs a warning-level message.
   * @param _args - Arguments to log.
   */
  warn: (..._args: unknown[]) => void;

  /**
   * Logs an error-level message.
   * @param _args - Arguments to log.
   */
  error: (..._args: unknown[]) => void;

  /**
   * Logs a general message.
   * @param _args - Arguments to log.
   */
  log: (..._args: unknown[]) => void;
};

/**
 * Valid logging levels that map to native `console` methods.
 * @public
 */
export type LogLevel = "debug" | "info" | "warn" | "error" | "log";

/**
 * Valid runtime log levels for log.level, setLogLevel, getLogLevel.
 * 'silent' disables all output. Not valid for log methods themselves.
 * @public
 */
export type RuntimeLogLevel = LogLevel | "silent";

/**
 * Optional configuration for each log invocation or global setup.
 * @public
 */
export interface LogOptions {
  /** Tag to display in `[TAG]` scope brackets */
  tag?: string;
  /** Include ISO 8601 UTC timestamp prefix */
  timestamp?: boolean;
  /** Use short form `[D]`, `[I]`, etc. for levels */
  levelShort?: boolean;
}