# [0.4.0](https://github.com/variablesoftware/logface/compare/v0.3.0...v0.4.0) (2025-05-25)


### Bug Fixes

* add linting step to release scripts for improved code quality ([fc076eb](https://github.com/variablesoftware/logface/commit/fc076ebb49c16970af7dd8674bfb3785e46b9645))
* add linting step to version bump scripts for improved code quality ([3dfee5d](https://github.com/variablesoftware/logface/commit/3dfee5db027d6274f43216935b9ee121387b8bc2))
* handle optional color library imports with error handling ([70fe972](https://github.com/variablesoftware/logface/commit/70fe97212afa954cec6f222cdb4d8a63f42e0f4f))


### Features

* add reusable log prefix matching helpers with regex support ([20e04bf](https://github.com/variablesoftware/logface/commit/20e04bf2b4d040b89244c1d25b426f9baf50766c))
* add user config loading and reloading functionality ([e9d9b66](https://github.com/variablesoftware/logface/commit/e9d9b66c4dcdb543dcab89427d4e41349c8bb359))
* enhance config loading functionality and improve log prefix matching tests ([0d0bff2](https://github.com/variablesoftware/logface/commit/0d0bff2cdae60c78d7e521befd69017e53d5ebb8))
* enhance log prefix matching helpers to support wildcard and optional tags ([958239b](https://github.com/variablesoftware/logface/commit/958239b71761517d43d7a307ec1e4be6b78466cd))

# [0.3.0](https://github.com/variablesoftware/logface/compare/v0.2.9...v0.3.0) (2025-05-23)

### Bug Fixes

- update parameter name in setLevel method and improve test assertions for idiomatic usage ([576a0c8](https://github.com/variablesoftware/logface/commit/576a0c87f8444eac19f6f5dff0cca09e2324d2b0))

### Features

- add setLevel and getLevel methods for runtime log level management ([37c4bd4](https://github.com/variablesoftware/logface/commit/37c4bd47eb49d979f1423513da7ffa9a8844206e))

## [0.2.9](https://github.com/variablesoftware/logface/compare/v0.2.8...v0.2.9) (2025-05-21)

### Bug Fixes

- update type assertion for logface methods and add SMOKE environment variable in workflow ([1021d8d](https://github.com/variablesoftware/logface/commit/1021d8d6026212ef8979ce1b3a76e36671dd0018))

# [0.2.0](https://github.com/variablesoftware/logface/compare/v0.1.3...v0.2.0) (2025-05-09)

### Bug Fixes

- add set -x to pre-commit and pre-push hooks for better debugging; update build scripts to use yarn ([767b2f7](https://github.com/variablesoftware/logface/commit/767b2f7b6bd748b917b20772822efd8c97fc34f4))
- correct export statement for Logger type ([ec3c112](https://github.com/variablesoftware/logface/commit/ec3c112584a120731c2f7e90b6c9369edaf694c3))
- reorder lint and build:test commands in pre-push hook for improved execution flow ([bd78f56](https://github.com/variablesoftware/logface/commit/bd78f5648424cee4e47d9b6b10a031f3f90f524d))
- update .gitignore to include additional archive formats; remove obsolete npm smoke test and related files ([9c06d67](https://github.com/variablesoftware/logface/commit/9c06d6738e68dbeef68704e98e92b28579c76da7))
- update @types/node version to 22.15.17 in package.json and yarn.lock; add unit and integration tests for logface package ([eb4186e](https://github.com/variablesoftware/logface/commit/eb4186e35f5d32ca332c10ebcedb9448632f9253))
- update job names in GitHub Actions workflow and adjust build steps; correct copyright year in LICENSE file; add typeRoots in tsconfig ([7c643cb](https://github.com/variablesoftware/logface/commit/7c643cb6a6cf675e3c24e65d6af443db34166f31))
- update version to 0.1.12 in package.json ([c36ae26](https://github.com/variablesoftware/logface/commit/c36ae263d8269cd1879c1d8150395d08dfbcc863))
- update version to 0.1.16 in package.json ([5697162](https://github.com/variablesoftware/logface/commit/56971622a6e67e04b67dd5c5f27b4f724d9a63b1))

### Features

- add initial smoke tests for npm package installability and importability; include Copilot instructions ([3436ad6](https://github.com/variablesoftware/logface/commit/3436ad64e49a15af59b6076cb117522d7dc330f1))
- update pre-commit and pre-push hooks for improved linting and build process; add Rollup configuration ([8ca7caf](https://github.com/variablesoftware/logface/commit/8ca7caff484004f28d6d97d6869455ab69bee9f1))
