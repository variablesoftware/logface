# Logface Logging & Configuration Guide

Logface is highly configurable. You can control log output style, emoji, color, and more.

## Configuration File

- Place a `logface.config.js` (CommonJS/ESM) or `logface.config.mjs` (ESM) in your project root.
- See `logface.example.config.js` for a template.

### Example: Fun & Colorful Logging

```js
// logface.config.js
module.exports = {
  emojiRandom: true,
  emojis: {
    debug: ["🐛", "🔍", "🦠"],
    info: ["ℹ️", "💡", "🧭"],
    log: ["📝", "📄", "🗒️"],
    warn: ["⚠️", "🚧", "🛑"],
    error: ["🔥", "💥", "💣"],
  },
  colorEnabled: true,
  colorLibrary: "kleur",
};
```

### Example: Minimal Output (for CI/tests)

```js
// logface.config.js
module.exports = {
  emojiRandom: false,
  emojis: { debug: "", info: "", log: "", warn: "", error: "" },
  colorEnabled: false,
};
```

## .js vs .mjs

- `.js` can be CommonJS or ESM (depends on `package.json` `type` field).
- `.mjs` is always ESM.

## How Emoji & Color Work

- Emoji are added as a prefix by logface (not stripped from your message).
- Disabling emoji/color only affects the prefix, not your message content.
- Randomization (`emojiRandom: true`) picks a random emoji from the array for each log message.

## Best Practices

- Ignore `logface.config.js` in git (add to `.gitignore`).
- Use the example config as a starting point.
- For stable test output, disable emoji and color in your test config or via environment variables.

---

### Table of Contents

- [Log Levels](#log-levels)
- [Runtime Log Level](#runtime-log-level)
- [Debug Gating](#debug-gating)
- [Filtering with LOG/LOG_VERBOSE](#filtering-with-loglog_verbose)
- [Wildcard Filtering](#wildcard-filtering)
- [Silent Mode](#silent-mode)
- [Tagging and Scoping](#tagging-and-scoping)
- [Testing Log Output](#testing-log-output)
- [Best Practices](#best-practices)
- [Example: Silent Logging in Production/Edge/Serverless](#example-silent-logging-in-productionedgeserverless)
- [Negation Filtering](#negation-filtering)

---

## Log Levels

Logface supports the following log levels:

- `debug`
- `info`
- `warn`
- `error`
- `log` (always emitted unless silent)

---

## Runtime Log Level

You can control which log levels are emitted at runtime:

```ts
log.level = "warn"; // Only warn, error, and log will be emitted
log.setLogLevel("error"); // Only error and log will be emitted
log.level = "silent"; // Suppress all output
log.level = "debug"; // Restore to default (all logs, if allowed by filters)
```

- The runtime log level is respected unless `LOG` or `LOG_VERBOSE` is set in the environment.
- If `LOG`/`LOG_VERBOSE` is set, those take precedence for filtering.
- Setting `log.level = 'silent'` or `log.setLogLevel('silent')` suppresses all output.

---

## Debug Gating

**Debug output is always gated:**

- Debug logs are only emitted if `LOG`/`LOG_VERBOSE` matches the tag/level, **or** if `log.level` is `'debug'` **and** `DEBUG=1` is set in the environment.
- This ensures debug output is never shown unless explicitly enabled.

---

## Filtering with LOG/LOG_VERBOSE

You can filter logs by tag or level using environment variables:

```bash
LOG=auth node app.js
LOG=metrics,debug,auth* node app.js
LOG_VERBOSE=api* node app.js
```

- Wildcards are supported (e.g. `auth:*`, `metrics*`).
- If neither `LOG` nor `LOG_VERBOSE` is set, the runtime log level is used.

---

## Wildcard Filtering

- Use wildcards to match multiple tags or levels.
- Examples:
  - `LOG=auth*` matches any tag starting with `auth`
  - `LOG=debug,metrics*` matches debug logs and any tag starting with `metrics`

---

## Silent Mode

- Set `log.level = 'silent'` or `log.setLogLevel('silent')` to suppress all log output.
- This is useful for tests or production environments where no logs should be emitted.

---

## Tagging and Scoping

- Use `log.options({ tag })` to scope logs:

```ts
log.options({ tag: "auth" }).info("User login");
log.options({ tag: "metrics", timestamp: true }).debug("Memory usage");
```

- You can also set global options with `log.setup({ ... })`.

---

## Testing Log Output

- To test debug output, set `process.env.DEBUG = '1'` in your test setup.
- To test filtering, set `process.env.LOG` or `process.env.LOG_VERBOSE` as needed.
- Use the runtime log level to control output in tests:

```ts
log.level = "warn";
log.level = "silent";
```

---

## Best Practices

- Always use `log.options({ tag })` for scoping logs.
- Avoid using `log.withTag` (deprecated).
- Never hardcode secrets or credentials in logs.
- Use runtime log level and environment variables to control output in different environments.
- Document your log tags and levels for maintainability.
- Use `log.level = 'silent'` in tests unless you are explicitly testing log output.

---

## Example: Silent Logging in Production/Edge/Serverless

In production or serverless environments (like Cloudflare Workers), you may want to suppress all log output by default to avoid unnecessary costs or noise.

```js
// At the top of your worker or server entrypoint
import logface from 'logface';

if (process.env.NODE_ENV === 'production' || process.env.CF_PAGES) {
  logface.setLogLevel('silent');
}
```

Or, in your config file:

```js
// logface.config.js
module.exports = {
  // ...other config...
  level: process.env.NODE_ENV === 'production' ? 'silent' : 'debug'
};
```

> **Tip:** Cloudflare Workers and some edge platforms may require a paid plan to view logs. Suppressing logs by default is a best practice for production deployments.

---

## Negation Filtering

- **Negation is supported in LOG/LOG_VERBOSE patterns:**
  - Prefix a pattern with `!` to suppress logs matching that pattern, unless also matched by a positive pattern.
  - Example: `LOG="!foo;auth,debug"` suppresses logs with tag `foo` unless they also match `auth` or `debug`.
  - Negation and positive patterns can be combined with commas or semicolons.

---

For more details, see the main [README.md](./README.md).
