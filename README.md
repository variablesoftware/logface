# @variablesoftware/logface 🎛️🪵😎

[![npm](https://img.shields.io/npm/v/@variablesoftware/logface.svg)](https://www.npmjs.com/package/@variablesoftware/logface)

> 🎛️🪵😎 A fun, lightweight, structured console-style logger with tag-based filtering for TypeScript projects.

---

## ✨ Features

- Drop-in replacements for `console.*` methods
- Scoped tagging via `log.options({ tag })`
- Filters logs with `LOG` or `LOG_VERBOSE` environment variables
- Per-call configuration with timestamps and level formatting
- Wildcard filtering support (e.g. `auth:*`, `metrics*`)

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

log.debug("booting up");
log.warn("careful now");
log.options({ tag: "auth" }).info("user signed in");
log.options({ tag: "metrics", timestamp: true }).info("CPU: %d%%", 92);
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
