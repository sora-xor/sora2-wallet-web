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

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
