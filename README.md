
# @variablesoftware/logface

> A fun, lightweight, structured console-style logger with tag-based filtering for TypeScript projects.  
> All the log fit for face. 😎

## ✨ Features

- Drop-in replacements for `console.*` methods
- Optional `withTag()` to namespace logs
- Supports filtering by tag or level via `LOG` or `LOG_VERBOSE` environment variables

## 🚀 Install

```bash
npm install @variablesoftware/logface
# or
yarn add @variablesoftware/logface
```

## 🔧 Usage

```ts
import { log } from "@variablesoftware/logface";

log.debug("booting up");
log.warn("careful now");
log.withTag("auth").info("user signed in");
```

### Environment filtering

```bash
LOG=auth,debug node your-app.js
```

## 🧪 Test

```bash
yarn test
```

Runs basic assertions to confirm output and tagged behavior.

---

Built with ❤️ by [@variablesoftware](https://github.com/variablesoftware)

## Badges

[![npm](https://img.shields.io/npm/v/@variablesoftware/logface.svg)](https://www.npmjs.com/package/@variablesoftware/logface)
