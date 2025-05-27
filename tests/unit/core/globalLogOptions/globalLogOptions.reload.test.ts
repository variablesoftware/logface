vi.mock('../../../../src/core/globalLogOptions', async () => {
  const actual = await vi.importActual<any>('../../../../src/core/globalLogOptions');
  let calledWithForce = false;
  return {
    ...actual,
    loadUserConfig: async (force?: boolean) => {
      calledWithForce = !!force;
      if (force === true && process.env.THROW_ON_FORCE === '1') throw new Error('fail');
      return force === true && process.env.THROW_ON_FORCE === '1' ? undefined : { ok: true };
    },
    __getCalledWithForce: () => calledWithForce,
  };
});

import { describe, it, expect, beforeEach, vi } from 'vitest';

const OLD_ENV = { ...process.env };

describe('reloadUserConfig', () => {
  beforeEach(() => {
    process.env = { ...OLD_ENV };
  });

  it('should call loadUserConfig with force=true', async () => {
    let calledWithForce = false;
    const fakeLoad = async (force?: boolean) => {
      calledWithForce = !!force;
      return { ok: true };
    };
    const { reloadUserConfig } = await import('../../../../src/core/globalLogOptions');
    const result = await reloadUserConfig(fakeLoad);
    expect(calledWithForce).toBe(true);
    expect(result).toMatchObject({ ok: true });
  });
});

describe('reloadUserConfig direct coverage', () => {
  beforeEach(() => {
    process.env = { ...OLD_ENV };
  });

  it('should call loadUserConfig with force=true and propagate errors', async () => {
    const fakeLoad = async (force?: boolean) => {
      if (force) throw new Error('fail');
      return { ok: true };
    };
    const { reloadUserConfig } = await import('../../../../src/core/globalLogOptions');
    let errorCaught: unknown = undefined;
    try {
      await reloadUserConfig(fakeLoad);
    } catch (e) {
      errorCaught = e;
    }
    expect(errorCaught).toBeInstanceOf(Error);
    expect((errorCaught as Error).message).toBe('fail');
  });
});
