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
  // Try to load config file dynamically (ESM or CJS)
  const fs = await import('fs');
  const path = await import('path');
  const cwd = process.cwd();
  const jsPath = path.join(cwd, 'logface.config.js');
  const mjsPath = path.join(cwd, 'logface.config.mjs');
  let config;
  if (fs.existsSync(jsPath)) {
    config = (await import(jsPath)).default || (await import(jsPath));
  } else if (fs.existsSync(mjsPath)) {
    config = (await import(mjsPath)).default || (await import(mjsPath));
  }
  return config;
}

/**
 * Reloads user config at runtime, bypassing LOGFACE_NO_CONFIG.
 */
export async function reloadUserConfig() {
  return loadUserConfig(true);
}
