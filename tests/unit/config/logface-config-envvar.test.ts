import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import logface from '../../../src';

const customConfigPath = path.resolve(__dirname, '../../../custom.logface.config.js');

function clearConfigCache() {
  Object.keys(require.cache).forEach((k) => {
    if (k.includes('custom.logface.config.js')) {
      delete require.cache[k];
    }
  });
}

describe('logface config: custom config via env', () => {
  let originalEnv: NodeJS.ProcessEnv;
  beforeEach(() => {
    originalEnv = { ...process.env };
    clearConfigCache();
  });
  afterEach(() => {
    process.env = { ...originalEnv };
    clearConfigCache();
  });
  it('should load config from path in LOGFACE_CONFIG env var', async () => {
    if (!fs.existsSync(customConfigPath)) {
      console.warn('SKIP: custom.logface.config.js not present, skipping test.');
      return;
    }
    process.env.LOGFACE_CONFIG = customConfigPath;
    clearConfigCache();
    const config = await logface.loadUserConfig();
    expect(config && config.tag).toBe('fromEnvConfig');
  });
});
