import { describe, it, expect, beforeEach } from 'vitest';
import { loadUserConfig, reloadUserConfig } from '../../../../src/core/globalLogOptions';

const OLD_ENV = { ...process.env };

describe('loadUserConfig: basic scenarios', () => {
  beforeEach(() => {
    process.env = { ...OLD_ENV };
  });

  it('should return undefined if LOGFACE_NO_CONFIG is set', async () => {
    process.env.LOGFACE_NO_CONFIG = '1';
    const config = await loadUserConfig();
    expect(config).toBeUndefined();
  });

  it('should return undefined if no config file exists', async () => {
    process.env.LOGFACE_CONFIG = 'nonexistent.config.js';
    const config = await loadUserConfig();
    expect(config).toBeUndefined();
  });
});
