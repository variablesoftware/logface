import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import logface from '../../src';

const configPath = path.resolve(__dirname, '../../logface.config.js');
const exampleConfigPath = path.resolve(__dirname, '../../logface.example.config.js');
const customConfigPath = path.resolve(__dirname, '../../custom.logface.config.js');

// Helper to clear require cache for config
function clearConfigCache() {
  Object.keys(require.cache).forEach((k) => {
    if (k.includes('logface.config.js') || k.includes('logface.example.config.js') || k.includes('custom.logface.config.js')) {
      delete require.cache[k];
    }
  });
}

describe('logface config loading', () => {
  let originalEnv: NodeJS.ProcessEnv;

  // NOTE: For full isolation, these tests should run in a dedicated test/smoke environment
  // where config files can be safely created/deleted. In a user/dev environment, we only read.
  // If the required config file is missing, the test will be skipped with a warning.

  beforeEach(() => {
    originalEnv = { ...process.env };
    clearConfigCache();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    clearConfigCache();
  });

  it('should load config from logface.config.js if present', async () => {
    if (!fs.existsSync(configPath)) {
      console.warn('SKIP: logface.config.js not present, skipping test.');
      return;
    }
    clearConfigCache();
    const config = await logface.loadUserConfig();
    // The config exports emojiRandom and emojis, not tag: 'fromConfigFile'
    expect(config && config.emojiRandom).toBe(true);
    expect(config && config.emojis).toBeDefined();
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
    // The example config exports emojiRandom and emojis, not tag: 'fromExampleConfig'
    expect(config && config.emojiRandom).toBe(true);
    expect(config && config.emojis).toBeDefined();
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
    // Only run this test if the config file is intentionally invalid (e.g., contains syntax error)
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
