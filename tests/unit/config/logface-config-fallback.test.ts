import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import logface from '../../../src';

const configPath = path.resolve(__dirname, '../../../logface.config.js');
const exampleConfigPath = path.resolve(__dirname, '../../../logface.example.config.js');

function clearConfigCache() {
  Object.keys(require.cache).forEach((k) => {
    if (k.includes('logface.config.js') || k.includes('logface.example.config.js')) {
      delete require.cache[k];
    }
  });
}

describe('logface config: fallback and invalid', () => {
  beforeEach(() => {
    clearConfigCache();
  });
  afterEach(() => {
    clearConfigCache();
  });
  it('should fallback to defaults if no config file is present', async () => {
    if (fs.existsSync(configPath) || fs.existsSync(exampleConfigPath)) {
      console.warn('SKIP: config files present, skipping fallback test.');
      return;
    }
    clearConfigCache();
    const config = await logface.loadUserConfig();
    expect(config).toBeUndefined();
  });
  it('should throw or warn if config file is invalid', async () => {
    if (!fs.existsSync(configPath)) {
      console.warn('SKIP: logface.config.js not present, skipping invalid config test.');
      return;
    }
    const configContent = fs.readFileSync(configPath, 'utf8');
    if (!configContent.includes('INVALID_SYNTAX')) {
      console.warn('SKIP: logface.config.js is not intentionally invalid, skipping invalid config test.');
      return;
    }
    clearConfigCache();
    let errorCaught = false;
    try {
      await logface.loadUserConfig();
    } catch (e) {
      errorCaught = true;
    }
    expect(errorCaught).toBe(true);
  });
});
