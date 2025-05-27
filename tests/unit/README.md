# Unit Test Organization

This folder organizes unit tests by concern for clarity and maintainability. Follow these conventions:

## Structure

- `core/` — Core logic (emitLog, logface-core, etc.)
- `utils/` — Utility modules (formatting, matching, etc.)
- `colorForLevel/` — Color/emoji logic
- `globalLogOptions/` — Global log options/config
- `config/` — Config/env loading and edge cases
- `levels/` — Log level logic/output
- `scope/` — Scope/routing/matching
- `helpers/` — Test helpers only

## Guidelines

- Keep test files focused and under 75-100 lines when possible.
- Split large test suites by concern.
- Use only ESM imports and test-only hooks for white-box testing.
- Do not use require() or dynamic import() to reload modules.
- Place reusable helpers in `helpers/`.

## Maintenance

Update this document if you add new concerns or subfolders.
