import { describe, it, expect, beforeEach } from 'vitest';
import { loadUserConfig } from '../../../../src/core/globalLogOptions';

const OLD_ENV = { ...process.env };

describe('loadUserConfig: import failure and error handling', () => {
  beforeEach(() => {
    process.env = { ...OLD_ENV };
  });

  it('should throw and return undefined if import fails and not in test env', async () => {
    const fs = await import('fs');
    const badFile = 'logface.bad.config.js';
    fs.writeFileSync(badFile, 'module.exports = (() => { throw new Error("fail"); })();');
    process.env.LOGFACE_CONFIG = badFile;
    process.env.NODE_ENV = 'production';
    let threw = false;
    let result;
    try {
      result = await loadUserConfig();
    } catch (e) {
      threw = true;
    }
    if (process.env.VITEST) {
      expect(threw).toBe(true);
    } else {
      expect(threw).toBe(false);
      expect(result).toBeUndefined();
    }
    fs.unlinkSync(badFile);
  });

  it('should return undefined if import fails and not in test env and not NODE_ENV or VITEST', async () => {
    const fs = await import('fs');
    const badFile = 'logface.bad2.config.js';
    fs.writeFileSync(badFile, 'module.exports = (() => { throw new Error("fail"); })();');
    process.env.LOGFACE_CONFIG = badFile;
    delete process.env.NODE_ENV;
    delete process.env.VITEST;
    let threw = false;
    let result;
    try {
      result = await loadUserConfig();
    } catch (e) {
      threw = true;
    }
    expect(threw).toBe(false);
    expect(result).toBeUndefined();
    fs.unlinkSync(badFile);
  });

  it('should return undefined if import fails and not in test env and not NODE_ENV or VITEST (simulate error object with no message)', async () => {
    const fs = await import('fs');
    const badFile = 'logface.bad3.config.js';
    fs.writeFileSync(badFile, 'module.exports = (() => { throw { custom: true }; })();');
    process.env.LOGFACE_CONFIG = badFile;
    delete process.env.NODE_ENV;
    delete process.env.VITEST;
    let threw = false;
    let result;
    try {
      result = await loadUserConfig();
    } catch (e) {
      threw = true;
    }
    expect(threw).toBe(false);
    expect(result).toBeUndefined();
    fs.unlinkSync(badFile);
  });
});
