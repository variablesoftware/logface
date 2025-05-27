// Tests for dynamic color library loading in colorForLevel
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const configPath = '../../../src/utils/colorForLevels/colorForLevel';

describe('colorForLevel dynamic color library loading', () => {
  let originalImport: any;
  beforeEach(async () => {
    originalImport = globalThis.__dynamicImport;
    // Reset dynamic state for test isolation
    const mod = await import(configPath);
    if (mod.__test_internals.__resetDynamicState) {
      mod.__test_internals.__resetDynamicState();
    }
  });
  afterEach(() => {
    vi.resetModules();
    if (originalImport) globalThis.__dynamicImport = originalImport;
  });

  it('handles all color libraries missing', async () => {
    globalThis.__dynamicImport = vi.fn().mockRejectedValue(new Error('not found'));
    const mod = await import(configPath);
    const { lib } = mod.__test_internals.getColorLib();
    expect(lib).toBeNull();
  });

  it('handles only chalk present', async () => {
    const mockImport = vi.fn()
      .mockImplementation((name: string) => {
        if (name === 'chalk') return Promise.resolve({ default: { gray: (s: string) => `c:${s}` } });
        return Promise.reject(new Error('not found'));
      });
    const mod = await import(configPath);
    mod.__test_internals.__setImportColorLib(mockImport);
    await mod.__test_reloadColorLib();
    const { lib } = mod.__test_internals.getColorLib();
    expect(typeof lib?.gray).toBe('function');
  });
});
