# @variablesoftware/logface 🎛️🪵😎

[![Test Suite](https://img.shields.io/badge/tests-passing-brightgreen)](https://github.com/variablesoftware/logface/actions)
[![NPM version](https://img.shields.io/npm/v/@variablesoftware/logface?style=flat-square)](https://www.npmjs.com/package/@variablesoftware/logface)
[![License](https://img.shields.io/github/license/variablesoftware/logface?style=flat-square)](https://github.com/variablesoftware/logface/blob/main/LICENSE.txt)
[![Coverage](https://img.shields.io/coveralls/github/variablesoftware/logface/main)](https://coveralls.io/github/variablesoftware/logface)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@variablesoftware/logface)](https://bundlephobia.com/package/@variablesoftware/logface)
[![Downloads](https://img.shields.io/npm/dm/@variablesoftware/logface)](https://www.npmjs.com/package/@variablesoftware/logface)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/variablesoftware/logface/pulls)

> 🎛️🪵😎 A fun, lightweight, structured console-style logger with tag-based filtering for TypeScript projects.

---

## ✨ Features

- Drop-in replacements for `console.*` methods: `debug`, `info`, `warn`, `error`, `log`
- Scoped tagging via `log.options({ tag })` (preferred) or `log.withTag(tag)` (**deprecated**)
- Filters logs using `LOG` or `LOG_VERBOSE` environment variables (supports wildcards)
- Runtime log level: `log.level = 'warn'` or `log.setLogLevel('warn')` to suppress lower levels (unless LOG/LOG_VERBOSE is set)
- Per-call configuration: timestamps, level formatting, and custom tags
- Wildcard filtering support (e.g. `auth:*`, `metrics*`)
- Global setup via `log.setup({ ... })`
- Designed for Node.js and edge runtimes
- **Debug output is always gated:** debug logs only appear if `LOG`/`LOG_VERBOSE` match, or if `log.level` is `'debug'` **and** `DEBUG=1` is set
- `log.level = 'silent'` or `log.setLogLevel('silent')` suppresses all output
- All log filtering logic falls back to `LOG`/`LOG_VERBOSE` if set, otherwise uses the runtime log level
- `log.withTag` is deprecated; use `log.options({ tag })` instead

---

## 🚀 Install

```bash
npm install @variablesoftware/logface
# or
yarn add @variablesoftware/logface
```

---

## 🔧 Quick Usage

```ts
import { log } from "@variablesoftware/logface";

// Basic usage
log.debug("Boot sequence initiated");
log.info("App started on port %d", 3000);
log.warn("Disk usage at %d%%", 91);
log.error("Database connection failed: %s", err.message);

// Scoped/tagged logs
log.options({ tag: "auth" }).debug("User login event");
log.options({ tag: "metrics", timestamp: true }).info("Memory: %dMB", 182);
log.options({ tag: "api", levelShort: false }).warn("Rate limit exceeded");

// Global setup
log.setup({ timestamp: true, levelShort: false });

// Runtime log level (NEW)
log.level = "warn"; // Only warn, error, and log will be emitted
log.setLogLevel("error"); // Only error and log will be emitted
log.level = "silent"; // Suppress all output

// Restore to default
log.level = "debug";

// Deprecated: use log.options({ tag }) instead
log.withTag("auth").info("This is deprecated");
```

---

## 📤 Output Format

```text
[D][init] Booting...
[I][auth] Login successful
[L][metrics] 200 OK
```

Use `log.setup()` to enable timestamps or full level names.

---

## 🔍 Filtering

Use `LOG` or `LOG_VERBOSE` to filter logs by tag or level:

```bash
LOG=auth node app.js
LOG=metrics,debug,auth* node app.js
```

If neither is set, you can control output at runtime:

```js
log.level = "warn"; // Only warn, error, and log
log.level = "silent"; // Suppress all output
```

Debug logs are only shown if `LOG`/`LOG_VERBOSE` match, or if `log.level` is 'debug' **and** `DEBUG=1` is set in the environment.

---

## 📚 Full Guide

For wildcard matching, structured output, test helpers, global setup, and advanced filtering:

➡️ [See LOGGING.md for full logging level guidance](https://github.com/variablesoftware/logface/blob/main/LOGGING.md)

---

## 📄 License

MIT © Rob Friedman / Variable Software

---

> Built with ❤️ by [@variablesoftware](https://github.com/variablesoftware)  
> Thank you for downloading and using this project. Pull requests are warmly welcomed!

---

## 🌐 Inclusive & Accessible Design

- Naming, logging, error messages, and tests avoid cultural or ableist bias
- Avoids assumptions about input/output formats or encodings
- Faithfully reflects user data — no coercion or silent transformations
- Designed for clarity, predictability, and parity with underlying platforms (e.g., Cloudflare APIs)
- Works well in diverse, multilingual, and inclusive developer environments

---

# Logface Configuration

Logface supports powerful customization via a config file. You can control emoji, color, and more for your log output.

## Quick Start

1. Copy the example config:
   ```sh
   cp logface.example.config.js logface.config.js
   ```
2. Edit `logface.config.js` to your liking.

## Example: Multiple Emoji Sets & Randomization

```js
// logface.config.js
module.exports = {
  emojiRandom: true, // Random emoji per log message
  emojis: {
    debug: ["🐛", "🔍", "🦠"],
    info: ["ℹ️", "💡", "🧭"],
    log: ["📝", "📄", "🗒️"],
    warn: ["⚠️", "🚧", "🛑"],
    error: ["🔥", "💥", "💣"],
  },
  colorEnabled: true, // Enable/disable color
  colorLibrary: "chalk", // 'chalk', 'picocolors', 'colorette', or 'kleur'
};
```

## Disabling Emoji/Color in Tests

Logface disables emoji and color automatically during tests for stable output. You can also set these manually:

```js
module.exports = {
  emojiRandom: false,
  emojis: { debug: "", info: "", log: "", warn: "", error: "" },
  colorEnabled: false,
};
```

## Supported Config Options

- `emojiRandom`: `true` for random emoji per log, `false` for fixed.
- `emojis`: Object mapping log levels to emoji (array or string).
- `colorEnabled`: Enable/disable color output.
- `colorLibrary`: Choose color library: `'chalk'`, `'picocolors'`, `'colorette'`, `'kleur'`.

## .js vs .mjs

- Use `.js` for CommonJS or ESM (depends on your `package.json` `type`).
- Use `.mjs` for guaranteed ESM.

## Example: ESM Config

```js
// logface.config.mjs
export default {
  emojiRandom: true,
  emojis: {
    debug: ["🐛", "🔍", "🦠"],
    info: ["ℹ️", "💡", "🧭"],
    log: ["📝", "📄", "🗒️"],
    warn: ["⚠️", "🚧", "🛑"],
    error: ["🔥", "💥", "💣"],
  },
  colorEnabled: true,
  colorLibrary: "picocolors",
};
```

## Tips

- Add `logface.config.js` to your `.gitignore` to avoid committing user-specific config.
- See `logface.example.config.js` for a template.

---

For more, see [LOGGING.md](./LOGGING.md).
