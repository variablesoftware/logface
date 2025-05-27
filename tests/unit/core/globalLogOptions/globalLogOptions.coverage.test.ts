import { describe, it, expect, beforeEach } from 'vitest';
import { loadUserConfig } from '../../../../src/core/globalLogOptions';

const OLD_ENV = { ...process.env };

describe('loadUserConfig: coverage and edge cases', () => {
  beforeEach(() => {
    process.env = { ...OLD_ENV };
  });

  it('should return undefined if configPath is not set', async () => {
    const fs = await import('fs');
    const files = ['logface.config.js', 'logface.config.mjs', 'logface.example.config.js'];
    const renamed: string[] = [];
    for (const file of files) {
      if (fs.existsSync(file)) {
        fs.renameSync(file, file + '.bak');
        renamed.push(file);
      }
    }
    process.env.LOGFACE_CONFIG = '';
    const config = await loadUserConfig();
    expect(config).toBeUndefined();
    for (const file of renamed) {
      fs.renameSync(file + '.bak', file);
    }
  });

  it('should return undefined if configPath does not exist', async () => {
    process.env.LOGFACE_CONFIG = 'definitely-not-present.js';
    const config = await loadUserConfig();
    expect(config).toBeUndefined();
  });
});
