// tests/unit/emitLog.test.ts
// Unit tests for emitLog core logic and edge cases
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { emitLog, setLogLevel } from '../../../src/core/emitLog';

// Helper to reset log level after each test
const originalLogLevel = 'debug';

describe('emitLog', () => {
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let logSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let debugSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    setLogLevel(originalLogLevel);
  });

  afterEach(() => {
    infoSpy.mockRestore();
    logSpy.mockRestore();
    warnSpy.mockRestore();
    debugSpy.mockRestore();
    errorSpy.mockRestore();
    setLogLevel(originalLogLevel);
    delete process.env.LOG;
    delete process.env.LOG_VERBOSE;
    delete process.env.DEBUG;
  });

  it('should handle empty args array (no message)', () => {
    emitLog('info', []);
    expect(infoSpy).toHaveBeenCalled();
  });

  it('should handle format string with replacements', () => {
    emitLog('info', ['Hello %s %d', 'world', 42]);
    expect(infoSpy).toHaveBeenCalledWith(expect.any(String), 'Hello world 42');
  });

  it('should call console.log for level "log"', () => {
    emitLog('log', ['plain log']);
    expect(logSpy).toHaveBeenCalledWith(expect.any(String), 'plain log');
  });

  it('should not log if shouldLog is false', () => {
    process.env.LOG = 'nope';
    emitLog('info', ['should not log'], { tag: 'notmatch' });
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it('should use getCallerTag if no tag is provided', () => {
    emitLog('info', ['msg'], {});
    expect(infoSpy).toHaveBeenCalled();
  });

  it('should handle LOG/LOG_VERBOSE env and match tag', () => {
    process.env.LOG = 'testtag';
    emitLog('info', ['msg'], { tag: 'testtag' });
    expect(infoSpy).toHaveBeenCalled();
  });

  it('should handle LOG/LOG_VERBOSE env and match level', () => {
    process.env.LOG = 'info';
    emitLog('info', ['msg'], { tag: 'notmatch' });
    expect(infoSpy).toHaveBeenCalled();
  });

  it('should use runtime log level if no LOG/LOG_VERBOSE', () => {
    setLogLevel('warn');
    emitLog('warn', ['should log'], { tag: 'foo' });
    expect(warnSpy).toHaveBeenCalled();
  });

  it('should not log if runtime log level is silent', () => {
    setLogLevel('silent');
    emitLog('info', ['should not log'], { tag: 'foo' });
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it('should not log debug if DEBUG!=1 and runtimeLogLevel is debug', () => {
    setLogLevel('debug');
    delete process.env.DEBUG;
    emitLog('debug', ['should not log'], { tag: 'foo' });
    expect(debugSpy).not.toHaveBeenCalled();
  });
});
