import { describe, it, expect, afterEach } from 'vitest';
import logface from '../../src';

const originalEnv = { ...process.env };

// Helper to clear config env and reload
async function resetConfigEnv(noConfig = false) {
  if (noConfig) process.env.LOGFACE_NO_CONFIG = '1';
  else delete process.env.LOGFACE_NO_CONFIG;
  await logface.reloadUserConfig();
}

describe('logface config loading', () => {
  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('should load config file by default', async () => {
    await resetConfigEnv(false);
    const config = await logface.loadUserConfig();
    expect(config).toBeDefined();
    expect(config.emojis).toBeDefined();
  });

  it('should NOT load config file if LOGFACE_NO_CONFIG=1', async () => {
    await resetConfigEnv(true);
    const config = await logface.loadUserConfig();
    expect(config).toBeUndefined();
  });

  it('should force load config even if LOGFACE_NO_CONFIG=1 when forced', async () => {
    await resetConfigEnv(true);
    const config = await logface.loadUserConfig(true);
    expect(config).toBeDefined();
    expect(config.emojis).toBeDefined();
  });
});
