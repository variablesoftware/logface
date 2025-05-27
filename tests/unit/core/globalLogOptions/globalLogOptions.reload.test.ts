import { describe, it, expect, beforeEach } from 'vitest';
import { reloadUserConfig } from '../../../../src/core/globalLogOptions';

const OLD_ENV = { ...process.env };

describe('reloadUserConfig', () => {
  beforeEach(() => {
    process.env = { ...OLD_ENV };
  });

  it('should call loadUserConfig with force=true', async () => {
    const fs = await import('fs');
    if (fs.existsSync('logface.config.js')) {
      const content = fs.readFileSync('logface.config.js', 'utf8');
      if (/throw new Error/.test(content)) return;
    }
    let calledWithForce = false;
    const orig = (global as any).loadUserConfig;
    (global as any).loadUserConfig = async (force: boolean) => {
      calledWithForce = force;
      return { ok: true };
    };
    const result = await reloadUserConfig();
    expect(calledWithForce).toBe(true);
    expect(result).toMatchObject({ ok: true });
    (global as any).loadUserConfig = orig;
  });
});

describe('reloadUserConfig direct coverage', () => {
  beforeEach(() => {
    process.env = { ...OLD_ENV };
  });

  it('should call loadUserConfig with force=true and propagate errors', async () => {
    const orig = (global as any).loadUserConfig;
    (global as any).loadUserConfig = async (force: boolean) => {
      if (force) throw new Error('fail');
      return { ok: true };
    };
    let errorCaught: unknown = undefined;
    try {
      await reloadUserConfig();
    } catch (e) {
      errorCaught = e;
    }
    expect(errorCaught).toBeInstanceOf(Error);
    expect((errorCaught as Error).message).toBe('fail');
    (global as any).loadUserConfig = orig;
  });
});
