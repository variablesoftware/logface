/**
 * Global log configuration options (used as fallback).
 * @internal
 */
import type { LogOptions } from "../types/Logger.js";

export let globalLogOptions: LogOptions = {
  levelShort: true,
  timestamp: false,
};

/**
 * Loads user config from logface.config.js/.mjs unless LOGFACE_NO_CONFIG is set.
 * Returns the config object or undefined if not loaded.
 */
export async function loadUserConfig(force = false): Promise<Record<string, unknown> | undefined> {
  if (!force && process.env.LOGFACE_NO_CONFIG === '1') return undefined;
  const fs = await import('fs');
  const path = await import('path');
  const cwd = process.cwd();

  // Determine config file path
  let configPath: string | undefined;
  if (process.env.LOGFACE_CONFIG) {
    configPath = path.isAbsolute(process.env.LOGFACE_CONFIG)
      ? process.env.LOGFACE_CONFIG
      : path.join(cwd, process.env.LOGFACE_CONFIG);
  } else {
    const jsPath = path.join(cwd, 'logface.config.js');
    const mjsPath = path.join(cwd, 'logface.config.mjs');
    const examplePath = path.join(cwd, 'logface.example.config.js');
    if (fs.existsSync(jsPath)) configPath = jsPath;
    else if (fs.existsSync(mjsPath)) configPath = mjsPath;
    else if (fs.existsSync(examplePath)) configPath = examplePath;
  }
  if (!configPath || !fs.existsSync(configPath)) return undefined;

  // Always use dynamic import for config files
  try {
    const imported = await import(configPath);
    return imported && imported.default ? imported.default : imported;
  } catch (e) {
    if (process.env.NODE_ENV === 'test' || process.env.VITEST) throw e;
    return undefined;
  }
}

/**
 * Reloads user config at runtime, bypassing LOGFACE_NO_CONFIG.
 */
export async function reloadUserConfig(loadFn = loadUserConfig) {
  return loadFn(true);
}
