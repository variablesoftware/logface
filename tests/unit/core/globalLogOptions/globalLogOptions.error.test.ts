import { describe, it, expect, beforeEach } from 'vitest';
import { loadUserConfig } from '../../../../src/core/globalLogOptions';

const OLD_ENV = { ...process.env };

describe('loadUserConfig: error and fallback branches', () => {
  beforeEach(() => {
    process.env = { ...OLD_ENV };
  });

  it('should throw in test if config import fails', async () => {
    const fs = await import('fs');
    const badFile = 'logface.bad.config.js';
    fs.writeFileSync(badFile, 'module.exports = (() => { throw new Error("fail"); })();');
    process.env.LOGFACE_CONFIG = badFile;
    let threw = false;
    try {
      await loadUserConfig();
    } catch (e) {
      threw = true;
      expect(e).toBeInstanceOf(Error);
    }
    expect(threw).toBe(true);
    fs.unlinkSync(badFile);
    delete process.env.LOGFACE_CONFIG;
  });

  it('should return undefined if configPath is falsy (no config files and no LOGFACE_CONFIG)', async () => {
    const fs = await import('fs');
    const files = ['logface.config.js', 'logface.config.mjs', 'logface.example.config.js'];
    const renamed: string[] = [];
    for (const file of files) {
      if (fs.existsSync(file)) {
        fs.renameSync(file, file + '.bak');
        renamed.push(file);
      }
    }
    delete process.env.LOGFACE_CONFIG;
    const config = await loadUserConfig();
    expect(config).toBeUndefined();
    for (const file of renamed) {
      fs.renameSync(file + '.bak', file);
    }
  });
});
