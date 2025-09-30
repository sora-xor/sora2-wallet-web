# Architecture Overview

This document complements the README by describing how the SORA wallet plugin is structured and how the main pieces interact at runtime.

## High-level layout
- **Plugin entry (`src/index.ts`)** – Exposes the Vue plugin, initialization helpers and curated exports (components, mixins, Vuex utilities).
- **Vuex store (`src/store/`)** – Namespaced modules grouped under the `wallet` namespace. Each module encapsulates feature state (account, subscriptions, transactions, settings).
- **Services (`src/services/`)** – Imperative integrations with external systems such as blockchain RPC endpoints, indexers (Subsquid/Subquery) and companion wallets.
- **Utilities (`src/util/`)** – Reusable helpers for formatting, storage management and runtime checks.

## Bootstrap flow
1. **Store injection** – When the plugin is installed we expect the host application to provide a Vuex store. In standalone mode the wallet falls back to its internal store (`src/store/index.ts`).
2. **`waitForCore`** – Initializes the keyring, hydrates permissions and fetches whitelists/blacklists required by the UI.
3. **`waitForConnection`** – Opens a websocket connection using the endpoint configured via `connection.endpoint`.
4. **`initWallet`** – Registers local and remote wallets (`services/wallet`, `services/google`, `services/walletconnect`), starts subscriptions and marks the wallet as ready (`settings.setWalletLoaded`).

## Data providers
- **Blockchain access** – Powered by `@sora-substrate/sdk`. The shared `api` instance handles keyring management, subscriptions and transaction submission.
- **Indexers** – `services/indexer/index.ts` selects between Subquery and Subsquid backends. Their explorer services, data parsers and history filters are consumed by Vuex actions as well as exported for host apps.
- **Storage** – `src/util/storage.ts` exposes three storage layers (`storage`, `runtimeStorage`, `settingsStorage`) so session-sensitive data, runtime caches and user preferences stay isolated.

## Wallet provider roster
- **Browser extensions** – `services/wallet/index.ts` discovers polkadot.js compatible extensions and normalizes them through `BaseDotSamaWallet`.
- **Google Drive backups** – `services/google` integrates the Google API/Identity SDKs to surface encrypted account snapshots as wallet accounts. The `Accounts` class implements the `InjectedAccounts` interface expected by the wallet.
- **WalletConnect** – `services/walletconnect` instantiates WalletConnect v2 providers per chain, registering them in the same registry used for extensions. Disconnect callbacks pipe back into Vuex to keep state consistent.
- **Desktop/local wallets** – `services/sorawallet` and `services/google/wallet` populate in-app storage wallets when running in the desktop shell.

## Background services & alerts
- **Subscriptions** – `wallet/subscriptions` Vuex module activates internal (polling, Drive refresh) and network subscriptions once `initWallet` completes. All teardown happens when the host app destroys the root component, as described in the README.
- **Price alerts** – `AlertsApiService` keeps user-defined price alerts in sync, emits browser notifications and updates Vuex state when thresholds are hit/reset.
- **Storage sync** – `services/google/backup` encrypts/decrypts account payloads so Google Drive backups stay compatible with the polkadot-js JSON format.

## Component-store interaction
Components map Vuex state, getters and actions using decorators from `src/store/util.ts`. The helper builds nested decorator objects so complex modules (e.g., `wallet/account`) can be imported succinctly inside class-based Vue components.

## Store modules
- **`wallet/account`** – Account selection, keyring login/logout flows and address book helpers.
- **`wallet/transactions`** – Transaction queue, signing modal state and history pagination.
- **`wallet/settings`** – Permissions, indexer selection, price alerts and multisig flags.
- **`wallet/subscriptions`** – Wiring for API subscriptions, fiat price streams and associated cleanup routines.
- **`wallet/router`** – Guards that keep the host app on valid routes depending on wallet readiness.

## Extensibility tips
- **Adding a new wallet provider** – Implement the `Wallet` interface in `src/services/wallet/types.ts`, extend `BaseDotSamaWallet` if the provider uses polkadot.js APIs, then register it inside `services/wallet/index.ts`.
- **Adding an indexer** – Create a service under `src/services/indexer/`, provide `explorer`, `dataParser` and `historyElementsFilter`, and register it in `getIndexer`.
- **Registering new Vuex modules** – Follow the namespaces in `src/store/wallet/` and expose decorators via `createDecoratorsObject` so consuming apps get type-safe helpers.

## Related documents
- `docs/api-reference.md` – Export-level documentation matching the code comments refreshed in this pass.
- `README.md` – Quick-start guide and development workflow.
- `SECURITY.md` – Security policy and disclosure process.
