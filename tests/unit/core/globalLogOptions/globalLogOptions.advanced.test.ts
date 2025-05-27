import { describe, it, expect, beforeEach } from 'vitest';
import { loadUserConfig } from '../../../../src/core/globalLogOptions';

const OLD_ENV = { ...process.env };

describe('loadUserConfig: uncovered and advanced branches', () => {
  beforeEach(() => {
    process.env = { ...OLD_ENV };
  });

  it('should resolve configPath using LOGFACE_CONFIG absolute path', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const absPath = path.join(process.cwd(), 'logface.temp.config.js');
    fs.writeFileSync(absPath, 'module.exports = { testKey: 123 }');
    process.env.LOGFACE_CONFIG = absPath;
    const config = await loadUserConfig();
    expect(config).toBeDefined();
    expect(config && config.testKey).toBe(123);
    fs.unlinkSync(absPath);
  });

  it('should resolve configPath using LOGFACE_CONFIG relative path', async () => {
    const fs = await import('fs');
    const relPath = 'logface.temp2.config.js';
    fs.writeFileSync(relPath, 'module.exports = { testKey: 456 }');
    process.env.LOGFACE_CONFIG = relPath;
    const config = await loadUserConfig();
    expect(config).toBeDefined();
    expect(config && config.testKey).toBe(456);
    fs.unlinkSync(relPath);
  });

  it('should load .mjs config if present and .js is missing', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const jsPath = path.join(process.cwd(), 'logface.config.js');
    let renamed = false;
    if (fs.existsSync(jsPath)) {
      fs.renameSync(jsPath, jsPath + '.bak');
      renamed = true;
    }
    const mjsPath = path.join(process.cwd(), 'logface.config.mjs');
    fs.writeFileSync(mjsPath, 'export default { mjsKey: 789 }', 'utf8');
    const config = await loadUserConfig();
    expect(config).toBeDefined();
    expect(config && config.mjsKey).toBe(789);
    fs.unlinkSync(mjsPath);
    if (renamed) fs.renameSync(jsPath + '.bak', jsPath);
  });

  it('should load example config if .js and .mjs are missing', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const jsPath = path.join(process.cwd(), 'logface.config.js');
    const mjsPath = path.join(process.cwd(), 'logface.config.mjs');
    let renamedJs = false, renamedMjs = false;
    if (fs.existsSync(jsPath)) {
      fs.renameSync(jsPath, jsPath + '.bak');
      renamedJs = true;
    }
    if (fs.existsSync(mjsPath)) {
      fs.renameSync(mjsPath, mjsPath + '.bak');
      renamedMjs = true;
    }
    const examplePath = path.join(process.cwd(), 'logface.example.config.js');
    fs.writeFileSync(examplePath, 'module.exports = { exampleKey: 321 }');
    const config = await loadUserConfig();
    expect(config).toBeDefined();
    expect(config && config.exampleKey).toBe(321);
    fs.unlinkSync(examplePath);
    if (renamedJs) fs.renameSync(jsPath + '.bak', jsPath);
    if (renamedMjs) fs.renameSync(mjsPath + '.bak', mjsPath);
  });
});
