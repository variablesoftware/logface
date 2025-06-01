#!/bin/bash
set -xeuo pipefail

ORIG_CWD=$(pwd)

pnpm run clean
pnpm run build

export SMOKE=1

pnpm test tests/integration/smoke.test.ts

cleanup() {
  cd "$ORIG_CWD"
}
trap cleanup EXIT INT TERM
