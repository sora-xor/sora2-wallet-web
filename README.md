# sora2-wallet-web

## How to use

You should set vuex storage and endpoint to blockchain url when using it as a vue plugin:
```
import Vue from 'vue'
import Wallet, { connection } from '@soramitsu/soraneo-wallet-web'

import store from '@/store'
import * as env from '../../public/env.json'

connection.endpoint = env.BLOCKCHAIN_URL
Vue.use(Wallet, { store })
```

You can also use `storage` instance to interact with wallet data:

```
import { storage } from '@soramitsu/soraneo-wallet-web'

```

If you want to change some default wallet permissions, pass related object to `initWallet` function.
Here is example with default permissions:

```
const permissions = {
    sendAssets: true, // enable 'send' button in assets list
    swapAssets: true, // enable 'swap' button in assets list
}

initWallet({ permissions })
```

Also, you need to unsubscribe from events of balances updates and txs statuses sync when Vue root component will be destroyed.

```
import { Action } from 'vuex-class'

@Action resetActiveTransactions
@Action resetAccountAssetsSubscription
@Action resetRuntimeVersionSubscription
@Action resetFiatPriceAndApySubscription

beforeDestroy (): void {
    this.resetActiveTransactions()
    this.resetAccountAssetsSubscription()
    this.resetRuntimeVersionSubscription()
    this.resetFiatPriceAndApySubscription()
}
```

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Run your unit tests
```
yarn test:unit
```

### Run your end-to-end tests
```
yarn test:e2e
```

### Lints and fixes files
```
yarn lint
```

### Desktop
To run desktop version in the browser window, please change **isElectron** flag in `src/store/settings/state.ts`

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
