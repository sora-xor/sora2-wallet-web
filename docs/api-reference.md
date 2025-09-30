# API Reference

This document enumerates the public surface exported from `src/index.ts`. Use it as a complement to `docs/architecture.md` when integrating the wallet into a host application.

## Plugin bootstrap
- **default export** – Vue plugin that registers the wallet root component. Install it with `app.use` when you want the full UI bundle.
- **`initWallet(options?: WalletInitOptions)`** – Main initializer that wires the Vuex store, connects to the node, registers wallet providers (local, Google Drive, WalletConnect) and activates subscriptions. Always `await` this before touching wallet state.
- **`waitForCore(options?: WalletInitOptions)`** – Prepares the Vuex store and keyring. Useful for CLI tools or apps that need staged bootstrapping.
- **`api` / `connection`** – Shared instances from `@sora-substrate/sdk`. `connection.endpoint` sets the RPC URL, while `api` exposes all SDK helpers (keyring, account management, extrinsics).
- **`en`** – Default English locale bundle for the wallet UI.

## Storage helpers
- **`storage`** – Account-scoped storage (cleared on logout) used by the SDK for session data.
- **`runtimeStorage`** – Cache for runtime version specific data (e.g., chain constants fetched after boot).
- **`settingsStorage`** – Global preferences persisted across sessions (theme, indexer selection, permissions overrides).

## Vuex integration
- **`vuex.walletModules`** – Namespace map of Vuex modules (`wallet/account`, `wallet/settings`, etc.) for manual registration.
- **`vuex.attachDecorator`, `vuex.createDecoratorsObject`, `VuexOperation`** – Utilities that generate strongly typed decorators for class-based Vue components.
- **`WalletModules`** – Enum of available wallet Vuex modules for targeted imports.
- **`accountUtils`** – Collection of functions for signing in/out, exporting/importing accounts and working with the keyring.

## Services & utilities
- **`AlertsApiService`** – Singleton that manages price alerts and browser notifications.
- **`ScriptLoader`** – Wrapper around `vue-plugin-load-script` with uniform logging used by Google Drive and other dynamic integrations.
- **`getCurrentIndexer`** – Resolves the active indexer configuration (Subsquid/Subquery) based on Vuex settings.
- **`historyElementsFilter`** – Ready-to-use filter function for history queries when consuming Subsquid outside the store.
- **`WC`** – WalletConnect provider exports, mirroring the files under `src/services/walletconnect`.

## Data helpers
- **`getExplorerLinks(soraNetwork?)`** – Returns explorer URLs based on the configured network and runtime endpoint.
- **`groupRewardsByAssetsList(rewards)`** – Aggregates rewards from the SDK into UI-friendly totals.
- **`formatAccountAddress(address, withPrefix?, chainApi?)`** – Formats SS58 addresses and guards against invalid input.
- **`validateAddress(address)`** – Lightweight SS58 validation helper.
- **`beforeTransactionSign(store, api, mutationType?)`** – Ensures the account is unlocked (or shows the signer modal) before submitting a transaction.
- **`getAssetsSubset(tokens, filter)`** – Filters asset collections by group (native, synthetic, Ceres, Kensetsu).

## Components & mixins
- **`components`** – Object map with all Vue components that can be imported individually (wallet shell, dialogs, shared UI elements, account widgets, etc.). Use destructuring to lazily register only what your host app needs.
- **`mixins`** – Vue mixins that encapsulate common wallet behaviours such as fee warnings, number formatting, notifications, QR/camera access and pagination helpers.

## Type exports
- **`WALLET_CONSTS`** – Permission defaults, translation keys and enums that describe wallet behaviour.
- **`WALLET_TYPES`** – Shared TypeScript definitions (e.g., account metadata, transaction payloads).
- **`INDEXER_TYPES`, `SUBQUERY_TYPES`, `SUBSQUID_TYPES`** – Type enums and shapes used by the different indexer backends.
- **`VUEX_TYPES`** – Vuex-specific type guards for the wallet modules.

Refer to the source files noted in each section for deeper details; the in-code JSDoc has been refreshed to document behaviours and edge cases.
