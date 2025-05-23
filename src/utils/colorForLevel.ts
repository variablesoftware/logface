/**
 * Get a color function for a given log level.
 * @param level - The log level
 * @returns A function that colors a string for the given level
 */
import type { LogLevel } from "../types/Logger.js";
import fs from "fs";
import path from "path";

let chalk: unknown = null;
let picocolors: unknown = null;
let colorette: unknown = null;
let kleur: unknown = null;

// Dynamically import color libraries if available (no require())
(async () => {
  try {
    chalk = (await import('chalk')).default;
  } catch {
    chalk = null; // Library not available
  }
  try {
    picocolors = await import('picocolors');
  } catch {
    picocolors = null;
  }
  try {
    // @ts-expect-error: optional dependency, may not be installed
    colorette = await import('colorette');
  } catch {
    colorette = null;
  }
  try {
    // @ts-expect-error: optional dependency, may not be installed
    kleur = await import('kleur');
  } catch {
    kleur = null;
  }
})();

// --- Emoji and Theme Support ---
const defaultEmojis = {
  debug: ["🐛", "🧩", "🔍", "🔧"],
  info: ["ℹ️", "💡", "📘", "🟦"],
  log: ["📋", "📝", "📄", "🟩"],
  warn: ["⚠️", "🚨", "🟧", "🔶"],
  error: ["❌", "🔥", "🟥", "💥"],
};
let userEmojis: Record<string, string[] | undefined> = {};
let colorEnabled = true;

// Try to load logface.config.js or .mjs
(async () => {
  try {
    const configPathJs = path.resolve(process.cwd(), "logface.config.js");
    const configPathMjs = path.resolve(process.cwd(), "logface.config.mjs");
    let config: unknown = null;
    if (fs.existsSync(configPathJs)) {
      config = (await import(configPathJs)).default;
    } else if (fs.existsSync(configPathMjs)) {
      config = (await import(configPathMjs)).default;
    }
    if (config && typeof config === 'object') {
      const configObj = config as { emojis?: Record<string, string[]>; color?: boolean };
      if (configObj.emojis) userEmojis = configObj.emojis;
      if (typeof configObj.color === "boolean") colorEnabled = configObj.color;
    }
  } catch {
    /* ignore */
  }
})();

function getEmoji(level: string): string {
  // Always respect environment variable over config
  if (process.env && process.env.LOGFACE_NO_EMOJI === '1') return '';
  // Type-safe access for known levels, fallback for custom
  const known = ["debug", "info", "log", "warn", "error"] as const;
  let set: string[] = [];
  if (userEmojis[level]) set = userEmojis[level]!;
  else if ((known as readonly string[]).includes(level))
    set = defaultEmojis[level as keyof typeof defaultEmojis];
  if (!set.length) return "";
  return set[Math.floor(Math.random() * set.length)];
}

type ColorLibrary = {
  [key: string]: ((_s: string) => string) | undefined;
};

function getColorLib(): { lib: ColorLibrary | null; name: string | null } {
  if (chalk) return { lib: chalk as ColorLibrary, name: "chalk" };
  if (picocolors) return { lib: picocolors as ColorLibrary, name: "picocolors" };
  if (colorette) return { lib: colorette as ColorLibrary, name: "colorette" };
  if (kleur) return { lib: kleur as ColorLibrary, name: "kleur" };
  return { lib: null, name: null };
}

const { lib: colorLib, name: colorLibName } = getColorLib();

function styleWith(lib: ColorLibrary, method: string, ...styles: string[]) {
  let fn = lib?.[method];
  if (!fn || typeof fn !== 'function') return (_s: string) => _s;
  for (const style of styles) {
    const maybeFn: unknown = (fn as unknown as Record<string, unknown>)[style];
    if (typeof maybeFn === 'function') {
      // Only assign if the function matches the expected signature
      fn = maybeFn as (_s: string) => string;
    }
  }
  return (_s: string) => (typeof fn === 'function' ? fn(_s) : _s);
}

export function colorForLevel(level: LogLevel) {
  if (!colorEnabled) return (_s: string) => _s;
  switch (level) {
    case "debug":
      if (!colorLib) return (_s: string) => _s;
      if (colorLibName === "picocolors") return (_s: string) => colorLib.gray?.(_s) ?? _s;
      return styleWith(colorLib, "gray");
    case "info":
      if (!colorLib) return (_s: string) => _s;
      if (colorLibName === "picocolors") return (_s: string) => colorLib.cyan?.(_s) ?? _s;
      return styleWith(colorLib, "cyan");
    case "warn":
      if (!colorLib) return (_s: string) => _s;
      if (colorLibName === "picocolors")
        return (_s: string) => colorLib.yellow?.(_s) ?? _s;
      return styleWith(colorLib, "yellow", "bold");
    case "error":
      if (!colorLib) return (_s: string) => _s;
      if (colorLibName === "picocolors") return (_s: string) => colorLib.red?.(_s) ?? _s;
      return styleWith(colorLib, "red", "bold");
    case "log":
      if (!colorLib) return (_s: string) => _s;
      if (colorLibName === "picocolors")
        return (_s: string) => colorLib.white?.(_s) ?? _s;
      return styleWith(colorLib, "white");
    default:
      return (_s: string) => _s;
  }
}

export function styleTag(tag: string) {
  if (!colorEnabled || !colorLib) return tag;
  if (colorLib.underline) return colorLib.underline(tag);
  return tag;
}

export function styleTimestamp(ts: string) {
  if (!colorEnabled || !colorLib) return ts;
  if (colorLib.dim) return colorLib.dim(ts);
  return ts;
}

// --- Emoji in log output ---
export function emojiForLevel(level: string) {
  return getEmoji(level);
}
