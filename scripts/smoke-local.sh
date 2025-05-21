#!/bin/bash
set -xeuo pipefail

# Build and pack the package
yarn clean && yarn build
TARBALL=$(npm pack | tail -1)
TARBALL_PATH="$(pwd)/$TARBALL"

# Create a temp dir
TMPDIR=$(mktemp -d)
cd "$TMPDIR"
yarn init -y
yarn config set nodeLinker node-modules

# Install the tarball using yarn (avoids workspace protocol issues)
yarn add "@variablesoftware/logface@file:$TARBALL_PATH"

# Diagnostic: List files in dist/utils and dist/core after install
ls -l node_modules/@variablesoftware/logface/dist/utils/
ls -l node_modules/@variablesoftware/logface/dist/core/
realpath node_modules/@variablesoftware/logface/dist/utils/getCallerTag.js
cat node_modules/@variablesoftware/logface/dist/utils/getCallerTag.js

# Create a test file (move this up before test runs)
echo "import { log } from '@variablesoftware/logface'; log.info('hello from local smoke test');" > test.mjs

# Diagnostic: Show Node.js version
node --version

# Run the test (will likely fail, but keep for completeness)
node test.mjs || true

# Run the test
node test.mjs

echo "✅ Local smoke test succeeded"

# Cleanup function
cleanup() {
  cd "$OLDPWD"
  rm -rf "$TMPDIR"
  rm -f "$TARBALL"
}
trap cleanup EXIT INT TERM
