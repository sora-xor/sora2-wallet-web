# AGENTS Guide

This repository packages the SORA non-custodial wallet UI as a reusable Vue plugin plus a library of components, Vuex modules, and blockchain-facing services. Host applications can install the plugin end-to-end or import specific pieces (components, mixins, utilities) à la carte.

## Build & Development
- `yarn install` – install dependencies.
- `yarn dev` – launch the Vue 3 Vite development server with hot reload (`yarn serve` stays as an alias).
- `yarn build` – produce the distributable bundle via the Vite library build.
- `yarn typecheck` – run `vue-tsc` for template + TS validation.
- `yarn test:unit` / `yarn test:e2e` – execute the Vitest unit suite or Cypress e2e flow.
- `yarn lint` – run eslint/prettier.

All commands now target the Vue 3 codebase. The plugin entry point lives in `src/index.ts`, which exports the installer, initialization helpers, storage adapters, and curated components/composables.

## Project Primer
Key directories:
- `src/components/` – wallet dialogs, asset lists, onboarding screens, and shared widgets.
- `src/store/` – namespaced Vuex modules (`wallet/account`, `wallet/settings`, `wallet/transactions`, etc.).
- `src/services/` – blockchain/indexer adapters, wallet provider registries, Google Drive backups, and alert handlers.
- `src/util/` – formatting helpers, storage wrappers, script loaders, and error utilities.
- `docs/` – architecture and API reference guides that complement the inline JSDoc.

The codebase builds on top of `@sora-substrate/sdk`, which supplies the Polkadot connection, keyring utilities, and domain-specific helpers. Consumers configure the RPC endpoint through the exported `connection` object and await `initWallet` to finish before pulling state from the Vuex modules.

## Vue 3 Migration
The Vue 3 migration is complete. Components run on Vue 3, Vitest powers unit tests, and Vite drives local development. Downstream consumers can continue importing established entry points—the decorator APIs remain for backward compatibility while new composition utilities land incrementally.

See `docs/vue3-migration-plan.md` for the dependency audit, key decisions, and follow-up items to monitor as the ecosystem evolves.
