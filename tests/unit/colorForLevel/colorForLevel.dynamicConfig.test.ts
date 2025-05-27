// Tests for dynamic config and color library loading in colorForLevel
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// These tests are white-box and intentionally reset module cache
const configPath = '../../../src/utils/colorForLevels/colorForLevel';

describe('colorForLevel dynamic config and color library loading', () => {
  let originalExistsSync: any;
  let originalImportConfig: any;
  beforeEach(async () => {
    originalExistsSync = vi.spyOn(require('fs'), 'existsSync');
    const mod = await import(configPath);
    if (mod.__test_internals.__resetDynamicState) {
      mod.__test_internals.__resetDynamicState();
    }
    if (mod.__test_internals.__setImportConfig) {
      originalImportConfig = mod.__test_internals.__setImportConfig;
    }
  });
  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    // Reset colorLib import mock if present
    if (originalImportConfig) {
      import(configPath).then(mod => {
        if (mod.__test_internals.__setImportColorLib) {
          mod.__test_internals.__setImportColorLib((name: string) => import(name));
        }
      });
    }
  });

  it('loads config from logface.config.js if present', async () => {
    originalExistsSync.mockImplementation((p: string) => p.endsWith('logface.config.js'));
    const mod = await import(configPath);
    mod.__test_internals.__setImportColorLib(async (name: string) => {
      if (name === 'chalk') {
        return { default: { gray: (s: string) => `[gray]${s}` } };
      }
      return {};
    });
    await mod.__test_reloadColorLib();
    mod.__test_internals.__setImportConfig(async (_path: string) => ({ default: { emojis: { debug: ['X'] }, color: true } }));
    await mod.__test_reloadConfig();
    // Debug output for colorLib and color library internals
    const colorLib = mod.__test_internals.getColorLib().lib;
    console.log('DEBUG colorLib:', colorLib);
    if (colorLib) {
      console.log('DEBUG colorLib keys:', Object.keys(colorLib));
      console.log('DEBUG colorLib.gray:', typeof colorLib.gray);
      console.log('DEBUG colorLib.cyan:', typeof colorLib.cyan);
    }
    console.log('DEBUG chalk:', mod.__test_internals.chalk ? 'present' : 'null');
    console.log('DEBUG picocolors:', mod.__test_internals.picocolors ? 'present' : 'null');
    console.log('DEBUG colorette:', mod.__test_internals.colorette ? 'present' : 'null');
    console.log('DEBUG kleur:', mod.__test_internals.kleur ? 'present' : 'null');
    console.log('DEBUG process.env.LOGFACE_NO_COLOR:', process.env.LOGFACE_NO_COLOR);
    expect(mod.__test_internals.userEmojisRef().debug).toEqual(['X']);
    expect(colorLib).not.toBeNull();
  });

  it('loads config from logface.config.mjs if .js not present', async () => {
    originalExistsSync.mockImplementation((p: string) => p.endsWith('logface.config.mjs'));
    const mod = await import(configPath);
    mod.__test_internals.__setImportConfig(async (_path: string) => ({ default: { emojis: { info: ['Y'] }, color: true } }));
    await mod.__test_reloadConfig();
    expect(mod.__test_internals.userEmojisRef().info).toEqual(['Y']);
  });

  it('handles missing config files gracefully', async () => {
    originalExistsSync.mockReturnValue(false);
    const mod = await import(configPath);
    mod.__test_internals.__setImportConfig(async (_path: string) => ({}));
    expect(mod.__test_internals.userEmojisRef()).toEqual({});
  });

  it('handles config with no emojis or color', async () => {
    originalExistsSync.mockReturnValue(true);
    const mod = await import(configPath);
    mod.__test_internals.__setImportConfig(async (_path: string) => ({ default: {} }));
    expect(mod.__test_internals.userEmojisRef()).toEqual({});
  });

  it('handles config import error gracefully', async () => {
    originalExistsSync.mockImplementation((p: string) => p.endsWith('logface.config.js'));
    const mod = await import(configPath);
    mod.__test_internals.__setImportConfig(async (_path: string) => { throw new Error('fail'); });
    await expect(mod.__test_reloadConfig()).resolves.toBeUndefined();
    expect(mod.__test_internals.userEmojisRef()).toEqual({});
  });

  it('styleWith returns identity if chained style is not a function', async () => {
    const mod = await import(configPath);
    // Fake colorLib with a method that has a non-function chained style
    const fakeLib = {
      gray: Object.assign((s: string) => `[gray]${s}`, { bold: 42 })
    };
    const styled = mod.__test_internals.styleWith(fakeLib, 'gray', 'bold');
    expect(styled('test')).toBe('[gray]test');
  });
});
