# sora2-wallet-web

Vue plugin and reusable component library that brings the SORA non-custodial wallet UI and services into existing applications.

## Overview
- Ships as a Vue plugin (`src/index.ts`) that wires Vue components, Vuex modules and blockchain services together.
- Supports selective imports so host apps can cherry-pick components, mixins or utilities instead of registering the full plugin.
- Builds on top of `@sora-substrate/sdk` for blockchain connectivity and uses Vuex for all long-lived state.

## Architecture at a Glance
- `src/components/` – UI building blocks that compose wallet screens and dialogs.
- `src/store/` – Namespaced Vuex modules plus helper decorators (`src/store/util.ts`).
- `src/services/` – Integration points for indexers, wallet providers and external APIs.
- `src/util/` – Shared helpers for formatting, runtime checks and script loading.

## Integrating as a Vue Plugin
Set the Vuex store instance and blockchain endpoint before installing the plugin:

```
import { createApp } from 'vue'
import Wallet, { connection, initWallet } from '@soramitsu/soraneo-wallet-web'

import App from './App.vue'
import store from '@/store'
import env from '../public/env.json'

async function bootstrap () {
  connection.endpoint = env.BLOCKCHAIN_URL

  const app = createApp(App)

  app.use(store.original)
  app.use(Wallet, { store })

  await initWallet()

  app.mount('#app')
}

bootstrap()
```

Use the exported storage helpers to work with persisted wallet state:

```
import { storage } from '@soramitsu/soraneo-wallet-web'
```

### Customizing permissions
If you need to change default wallet permissions, pass the overrides to `initWallet`:

```
const permissions = {
    sendAssets: true, // enable 'send' button in assets list
    swapAssets: true, // enable 'swap' button in assets list
}

initWallet({ permissions })
```

### Unsubscribing from runtime subscriptions
Make sure to unsubscribe from balance updates and network subscriptions when the Vue root component is destroyed:

```
import { Action } from 'vuex-class'

@Action resetActiveTransactions
@Action resetAccountAssetsSubscription
@Action resetRuntimeVersionSubscription
@Action resetFiatPriceAndApySubscription

beforeUnmount (): void {
    this.resetActiveTransactions()
    this.resetAccountAssetsSubscription()
    this.resetRuntimeVersionSubscription()
    this.resetFiatPriceAndApySubscription()
}
```

## Wallet bootstrap sequence
1. `waitForCore` initializes the Vuex store and keyring, applying optional permission overrides.
2. `waitForConnection` opens the websocket connection to the configured node.
3. `initWallet` ties the steps together, registers available wallets (local, Google Drive, WalletConnect) and activates network subscriptions.

Refer to `src/index.ts` for the exported helpers.

## Development Setup
```
yarn install        # install dependencies
yarn serve          # compile and hot-reload for development
yarn build          # compile and minify for production
yarn test:unit      # run unit tests
yarn test:e2e       # run end-to-end tests
yarn lint           # lint and autofix issues
```

## Desktop mode
To run the desktop version in a browser window, toggle the `isElectron` flag in `src/store/settings/state.ts`.

## Additional resources
- `AGENTS.md` – quick guide for contributors highlighting build commands and the upcoming Vue 3 migration.
- `docs/api-reference.md` – catalog of exports exposed by the wallet plugin (components, services, utilities).
- `docs/architecture.md` – high-level explanation of data flow, Vuex modules and external dependencies.
- `docs/vue3-migration-plan.md` – dependency audit and phased rollout plan for the Vue 3 migration.
- `SECURITY.md` – security policies and responsible disclosure process.
- See the [Vue CLI configuration reference](https://cli.vuejs.org/config/) for advanced build tweaks.
