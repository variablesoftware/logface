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