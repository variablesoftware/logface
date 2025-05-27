import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import logface from '../../../src';

const originalEnv = { ...process.env };

// Helper to clear config env and reload
async function resetConfigEnv(noConfig = false) {
  if (noConfig) process.env.LOGFACE_NO_CONFIG = '1';
  else delete process.env.LOGFACE_NO_CONFIG;
  await logface.reloadUserConfig();
}

describe('logface config loading', () => {
  let skipAll = false;
  beforeEach(async function () {
    // Skip all tests if config is intentionally invalid (for coverage)
    const fs = await import('fs');
    if (fs.existsSync('logface.config.js')) {
      const content = fs.readFileSync('logface.config.js', 'utf8');
      if (/throw new Error/.test(content)) {
        // eslint-disable-next-line no-console
        console.warn('SKIP: logface.config.js is intentionally invalid (throws error), skipping config env tests.');
        skipAll = true;
      }
    }
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('should load config file by default', async () => {
    if (skipAll) return;
    await resetConfigEnv(false);
    const config = await logface.loadUserConfig();
    expect(config).toBeDefined();
    expect(config && config.emojis).toBeDefined();
  });

  it('should NOT load config file if LOGFACE_NO_CONFIG=1', async () => {
    if (skipAll) return;
    await resetConfigEnv(true);
    const config = await logface.loadUserConfig();
    expect(config).toBeUndefined();
  });

  it('should force load config even if LOGFACE_NO_CONFIG=1 when forced', async () => {
    if (skipAll) return;
    await resetConfigEnv(true);
    const config = await logface.loadUserConfig(true);
    expect(config).toBeDefined();
    expect(config && config.emojis).toBeDefined();
  });
});
