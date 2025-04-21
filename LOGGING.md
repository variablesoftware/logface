# Logface Logging Guide 🪵😎

A deep dive into `@variablesoftware/logface` logging features, formatting options, filtering behaviors, and best practices for structured logs in Node.js or edge runtimes.

---

## 📦 Supported Levels

| Level  | Method         | Label | Console Method |
|--------|----------------|-------|----------------|
| Debug  | `log.debug()`  | `[D]` | `console.debug()` |
| Info   | `log.info()`   | `[I]` | `console.info()`  |
| Warn   | `log.warn()`   | `[W]` | `console.warn()`  |
| Error  | `log.error()`  | `[E]` | `console.error()` |
| Log    | `log.log()`    | `[L]` | `console.log()`   |

---

## 🏷️ Scope Tagging

You can scope logs with tags to organize by feature/module:

```ts
log.options({ tag: "auth" }).warn("Invalid credentials");
log.options({ tag: "metrics" }).info("CPU usage: %d%%", 93);
```

These tags show up in the formatted log prefix:
```
[I][metrics] CPU usage: 93%
```

---

## 🕵️ Environment Filtering with `LOG`

Use `LOG` (or `LOG_VERBOSE`) to control what gets printed:

```bash
LOG=auth node app.js
LOG=auth*,metrics,debug* node app.js
```

### ✨ Wildcard Matching
- `auth*` matches: `auth`, `authLogin`, `auth:jwt`
- `auth:*` matches: `auth`, `auth:signup`, `auth:*`

### ✅ Matching Conditions
A log is printed if:
- `tag` matches a filter
- OR `level` matches a filter (e.g. `LOG=warn`)
- OR no filter is set (default: allow all)

---

## 🧪 Testing with Vitest

```ts
const spy = vi.spyOn(console, "info").mockImplementation(() => {});
process.env.LOG = "auth";
log.options({ tag: "auth" }).info("should print");
expect(spy).toHaveBeenCalledWith("[I][auth]", "should print");
```

---

## 🔧 Global Setup

```ts
import { log, setup } from "@variablesoftware/logface";

setup({
  levelShort: false, // full level names like [DEBUG]
  timestamp: true,   // ISO timestamp prefix
});
```

---

## 📤 Sample Output

```
[2025-04-21T18:44:00.123Z] [I][metrics] CPU usage: 93%
[2025-04-21T18:44:01.002Z] [E][db] Failed to connect to replica set
```

---

## 🛑 Deprecated

`log.withTag("...")` is deprecated. Use `log.options({ tag })` instead.

```ts
// Deprecated
log.withTag("auth").info("message");

// Preferred
log.options({ tag: "auth" }).info("message");
```

---

## 🧭 Roadmap Ideas

- Output coloring via ANSI codes
- Optional file logger integration
- Structured JSON log format
- CLI tooling for tailing/filtering

---

Happy logging! 🪵

