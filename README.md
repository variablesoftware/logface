# @variablesoftware/logface 🪵😎

[![npm](https://img.shields.io/npm/v/@variablesoftware/logface.svg)](https://www.npmjs.com/package/@variablesoftware/logface)

> A fun, lightweight, structured console-style logger with tag-based filtering for TypeScript projects.

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

➡️ [See LOGGING.md](./LOGGING.md)

---

Built with ❤️ by [@variablesoftware](https://github.com/variablesoftware)

