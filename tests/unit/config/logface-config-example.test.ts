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

describe('logface config: example config loading', () => {
  beforeEach(() => {
    clearConfigCache();
  });
  afterEach(() => {
    clearConfigCache();
  });
  it('should load config from logface.example.config.js if main config missing', async () => {
    if (!fs.existsSync(exampleConfigPath)) {
      console.warn('SKIP: logface.example.config.js not present, skipping test.');
      return;
    }
    if (fs.existsSync(configPath)) {
      console.warn('SKIP: logface.config.js present, skipping test.');
      return;
    }
    clearConfigCache();
    const config = await logface.loadUserConfig();
    expect(config && config.emojiRandom).toBe(true);
    expect(config && config.emojis).toBeDefined();
  });
});
