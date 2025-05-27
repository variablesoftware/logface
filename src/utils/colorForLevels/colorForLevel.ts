/**
 * Get a color function for a given log level.
 * @param level - The log level
 * @returns A function that colors a string for the given level
 */
import type { LogLevel } from "../../types/Logger.js";
import fs from "fs";
import path from "path";

let chalk: unknown = null;
let picocolors: unknown = null;
let colorette: unknown = null;
let kleur: unknown = null;

// --- Color library dynamic import mocks (for test injection) ---
let importConfigMock: ((_path: string) => Promise<{ default: unknown }>) | null = null;
let importColorLibMock: ((_name: string) => Promise<{ default: unknown }>) | null = null;

let __importConfig: (_path: string) => Promise<unknown> = (_path) => import(_path);
let __importColorLib: (_name: string) => Promise<unknown> = (_name) => import(_name);

/**
 * @internal Test-only: override the import function for config loading
 */
export function __setImportConfig(fn: (_path: string) => Promise<unknown>) {
  __importConfig = fn;
}

/**
 * @internal Test-only: override the import function for color libraries
 */
export function __setImportColorLib(fn: (_name: string) => Promise<unknown>) {
  __importColorLib = fn;
}

// Dynamically import color libraries if available (no require())
(async () => {
  try {
    chalk = (await __importColorLib('chalk') as { default: unknown }).default;
  } catch {
    chalk = null; // Library not available
  }
  try {
    picocolors = await __importColorLib('picocolors');
  } catch {
    picocolors = null;
  }
  try {
    colorette = (await import('colorette')).default;
  } catch {
    colorette = null;
  }
  try {
    kleur = (await import('kleur')).default;
  } catch {
    kleur = null;
  }
})();

// --- Emoji and Theme Support ---
const defaultEmojis = {
  debug: ["🦋","🐛", "🧩", "🔍", "🔧"],
  info: ["😎","ℹ️", "💡", "📘", "🟦"],
  log: ["🪵","📋", "📝", "📄", "🟩"],
  warn: ["🚧","⚠️", "🚨", "🟧", "🔶"],
  error: ["🛑","❌", "🔥", "🟥", "💥"],
};
let userEmojis: Record<string, string[] | undefined> = {};
let colorEnabled = true;

// Try to load logface.config.js or .mjs
async function reloadConfig() {
  try {
    const configPathJs = path.resolve(process.cwd(), "logface.config.js");
    const configPathMjs = path.resolve(process.cwd(), "logface.config.mjs");
    let config: unknown = null;
    if (fs.existsSync(configPathJs)) {
      config = (await __importConfig(configPathJs) as { default: unknown }).default;
    } else if (fs.existsSync(configPathMjs)) {
      config = (await __importConfig(configPathMjs) as { default: unknown }).default;
    }
    if (config && typeof config === 'object') {
      const configObj = config as { emojis?: Record<string, string[]>; color?: boolean };
      if (configObj.emojis) userEmojis = configObj.emojis;
      if (typeof configObj.color === "boolean") colorEnabled = configObj.color;
    }
  } catch {
    /* ignore */
  }
}

// IIFE for initial config load
(async () => { await reloadConfig(); })();

function getEmoji(level: string): string {
  // Always respect environment variable over config
  if (process.env && process.env.LOGFACE_NO_EMOJI === '1') return '';
  // Type-safe access for known levels, fallback for custom
  const known = ["debug", "info", "log", "warn", "error"] as const;
  let set: string[] = [];
  if (Object.hasOwn(userEmojis, level)) {
    if (Array.isArray(userEmojis[level])) set = userEmojis[level]!;
    else return '';
  } else if ((known as readonly string[]).includes(level)) {
    set = defaultEmojis[level as keyof typeof defaultEmojis];
  }
  if (!set.length) return "";
  return set[Math.floor(Math.random() * set.length)];
}

type ColorLibrary = {
  [key: string]: ((_s: string) => string) | undefined;
};

// Patch: expose colorLib and colorLibName for test injection
let colorLib: ColorLibrary | null = null;
let colorLibName: string | null = null;

// TEST-ONLY: expose internals for white-box testing
export const __test_internals = {
  getEmoji,
  defaultEmojis,
  userEmojisRef: () => userEmojis,
  setUserEmojis: (emojis: Record<string, string[] | undefined>) => { userEmojis = emojis; },
  setColorEnabled: (enabled: boolean) => { colorEnabled = enabled; },
  getColorLib,
  styleWith,
  /**
   * @internal Test-only: reset all dynamic state for test isolation
   */
  __resetDynamicState: () => {
    colorLib = null;
    colorLibName = null;
    userEmojis = {};
    colorEnabled = true;
    chalk = null;
    picocolors = null;
    colorette = null;
    kleur = null;
    importConfigMock = null;
    importColorLibMock = null;
  },
  /**
   * @internal Test-only: reload config from disk (for test mocks)
   */
  __test_reloadConfig,
  /**
   * @internal Test-only: reload color libraries (for test mocks)
   */
  __test_reloadColorLib,
  __setImportConfig: (fn: (_path: string) => Promise<unknown>) => {
    importConfigMock = async (_path: string) => {
      const result = await fn(_path);
      if (result && typeof result === 'object' && 'default' in result) {
        return result as { default: unknown };
      }
      return { default: result };
    };
  },
  __setImportColorLib: (fn: (_name: string) => Promise<unknown>) => {
    importColorLibMock = async (_name: string) => {
      const result = await fn(_name);
      if (result && typeof result === 'object' && 'default' in result) {
        return result as { default: unknown };
      }
      return { default: result };
    };
  },
  chalk: () => chalk,
  picocolors: () => picocolors,
  colorette: () => colorette,
  kleur: () => kleur,
};

// TEST-ONLY: reload config and colorLib for dynamic test control
/**
 * @internal Test-only: reload config from disk (for test mocks)
 */
export async function __test_reloadConfig() {
  try {
    const configPathJs = path.resolve(process.cwd(), "logface.config.js");
    const configPathMjs = path.resolve(process.cwd(), "logface.config.mjs");
    let config: unknown = null;
    if (fs.existsSync(configPathJs)) {
      config = importConfigMock
        ? (await importConfigMock(configPathJs)).default
        : (await import(configPathJs)).default;
    } else if (fs.existsSync(configPathMjs)) {
      config = importConfigMock
        ? (await importConfigMock(configPathMjs)).default
        : (await import(configPathMjs)).default;
    }
    if (config && typeof config === 'object') {
      const configObj = config as { emojis?: Record<string, string[]>; color?: boolean };
      if (configObj.emojis) userEmojis = configObj.emojis;
      if (typeof configObj.color === "boolean") colorEnabled = configObj.color;
    }
  } catch {
    /* ignore */
  }
}
/**
 * @internal Test-only: reload color libraries (for test mocks)
 */
export async function __test_reloadColorLib() {
  try {
    chalk = importColorLibMock
      ? (await importColorLibMock('chalk')).default
      : (await import('chalk')).default;
  } catch {
    chalk = null;
  }
  try {
    picocolors = importColorLibMock
      ? (await importColorLibMock('picocolors')).default
      : (await import('picocolors')).default;
  } catch {
    picocolors = null;
  }
  try {
    colorette = importColorLibMock
      ? (await importColorLibMock('colorette')).default
      : (await import('colorette')).default;
  } catch {
    colorette = null;
  }
  try {
    kleur = importColorLibMock
      ? (await importColorLibMock('kleur')).default
      : (await import('kleur')).default;
  } catch {
    kleur = null;
  }
  colorLib = null;
  colorLibName = null;
}

// Patch: ensure getColorLib is always synchronous
function getColorLib(): { lib: ColorLibrary | null; name: string | null } {
  if (colorLib !== null || colorLibName !== null) {
    return { lib: colorLib, name: colorLibName };
  }
  if (chalk) return { lib: chalk as ColorLibrary, name: "chalk" };
  if (picocolors) return { lib: picocolors as ColorLibrary, name: "picocolors" };
  if (colorette) return { lib: colorette as ColorLibrary, name: "colorette" };
  if (kleur) return { lib: kleur as ColorLibrary, name: "kleur" };
  return { lib: null, name: null };
}

function styleWith(lib: ColorLibrary, method: string, ...styles: string[]): (_input: string) => string {
  if (!lib || typeof lib !== 'object') return (_input: string) => _input;
  // Defensive: if method is not a string or not in lib, return identity
  if (typeof method !== 'string' || !(method in lib)) return (_input: string) => _input;
  let fn = lib[method];
  if (!fn || typeof fn !== 'function') return (_input: string) => _input;
  for (const style of styles) {
    // Defensive: chained style may be a function or undefined
    const maybeFn = (fn as unknown as Record<string, unknown>)[style];
    if (typeof maybeFn === 'function') {
      fn = maybeFn as (_input: string) => string;
    }
  }
  return (_input: string) => (typeof fn === 'function' ? fn(_input) : _input);
}

// Patch: revert colorForLevel to NOT use await getColorLib()
// Use synchronous getColorLib() as before
export function colorForLevel(level: LogLevel) {
  if (!colorEnabled) return (_input: string) => _input;
  const { lib: colorLib, name: colorLibName } = getColorLib();
  switch (level) {
    case "debug":
      if (!colorLib) return (_input: string) => _input;
      if (colorLibName === "picocolors") return (_input: string) => colorLib.gray?.(_input) ?? _input;
      return styleWith(colorLib, "gray");
    case "info":
      if (!colorLib) return (_input: string) => _input;
      if (colorLibName === "picocolors") return (_input: string) => colorLib.cyan?.(_input) ?? _input;
      return styleWith(colorLib, "cyan");
    case "warn":
      if (!colorLib) return (_input: string) => _input;
      if (colorLibName === "picocolors")
        return (_input: string) => colorLib.yellow?.(_input) ?? _input;
      return styleWith(colorLib, "yellow", "bold");
    case "error":
      if (!colorLib) return (_input: string) => _input;
      if (colorLibName === "picocolors") return (_input: string) => colorLib.red?.(_input) ?? _input;
      return styleWith(colorLib, "red", "bold");
    case "log":
      if (!colorLib) return (_input: string) => _input;
      if (colorLibName === "picocolors")
        return (_input: string) => colorLib.white?.(_input) ?? _input;
      return styleWith(colorLib, "white");
    default:
      return (_input: string) => _input;
  }
}

export function styleTag(tag: string) {
  if (!colorEnabled) return tag;
  const { lib: colorLib } = getColorLib();
  if (!colorLib) return tag;
  if (colorLib.underline) return colorLib.underline(tag);
  return tag;
}

export function styleTimestamp(ts: string) {
  if (!colorEnabled) return ts;
  const { lib: colorLib } = getColorLib();
  if (!colorLib) return ts;
  if (colorLib.dim) return colorLib.dim(ts);
  return ts;
}

// --- Emoji in log output ---
export function emojiForLevel(level: string) {
  return getEmoji(level);
}

// Add test-only setters for colorEnabled and colorLib
/**
 * @internal Test-only: override colorEnabled for unit tests
 */
export function __setColorEnabled(enabled: boolean) {
  colorEnabled = enabled;
}
/**
 * @internal Test-only: override colorLib and colorLibName for unit tests
 */
export function __setColorLib(lib: ColorLibrary, name: string) {
  colorLib = lib;
  colorLibName = name;
}
