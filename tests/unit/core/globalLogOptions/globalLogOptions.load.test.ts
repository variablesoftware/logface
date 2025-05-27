import { describe, it, expect, beforeEach } from 'vitest';
import { loadUserConfig, reloadUserConfig } from '../../../../src/core/globalLogOptions';

const OLD_ENV = { ...process.env };

describe('loadUserConfig: config file loading', () => {
  beforeEach(() => {
    process.env = { ...OLD_ENV };
  });

  it('should load config from logface.config.js if present', async () => {
    const fs = await import('fs');
    if (!fs.existsSync('logface.config.js')) return;
    const content = fs.readFileSync('logface.config.js', 'utf8');
    if (/throw new Error/.test(content)) return;
    const config = await loadUserConfig();
    expect(config).toBeDefined();
    expect(typeof config).toBe('object');
    expect(config).toHaveProperty('emojiRandom');
  });

  it('should reload config with reloadUserConfig', async () => {
    const fs = await import('fs');
    if (!fs.existsSync('logface.config.js')) return;
    const content = fs.readFileSync('logface.config.js', 'utf8');
    if (/throw new Error/.test(content)) return;
    const config = await reloadUserConfig();
    expect(config).toBeDefined();
    expect(typeof config).toBe('object');
  });
});
