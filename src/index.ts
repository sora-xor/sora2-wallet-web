import Vue from 'vue'
import debounce from 'lodash/fp/debounce'
import type { Store } from 'vuex'

import installWalletPlugins from './plugins'
// import './styles' We don't need it for now

// Components
import SoraWallet from './SoraWallet.vue'
import WalletAvatar from './components/WalletAvatar.vue'
import InfoLine from './components/InfoLine.vue'
import FormattedAmount from './components/FormattedAmount.vue'
import FormattedAmountWithFiatValue from './components/FormattedAmountWithFiatValue.vue'
// Mixins
import NumberFormatterMixin from './components/mixins/NumberFormatterMixin'
import FormattedAmountMixin from './components/mixins/FormattedAmountMixin'

import { Modules } from './types/common'
import en from './lang/en'
import internalStore, { modules } from './store' // `internalStore` is required for local usage
import { storage } from './util/storage'
import { api, connection } from './api'
import { delay, getExplorerLinks } from './util'
import * as WALLET_CONSTS from './consts'

let store: Store<unknown>
let isWalletLoaded = false
let unsubscribeStoreFromStorage: Function

const subscribeStoreToStorageUpdates = store => {
  if (typeof unsubscribeStoreFromStorage === 'function') {
    unsubscribeStoreFromStorage()
  }

  const syncWithStorageHandler = debounce(100)(() => store.dispatch('syncWithStorage'))

  window.addEventListener('storage', syncWithStorageHandler)

  unsubscribeStoreFromStorage = () => window.removeEventListener('storage', syncWithStorageHandler)
}

const SoraWalletElements = {
  install (vue: typeof Vue, options: any): void {
    if (!options.store) {
      throw new Error('Please provide vuex store.')
    }
    Object.values(Modules).forEach(module => {
      options.store.registerModule(module, modules[module])
    })
    store = options.store
    installWalletPlugins(vue, store)
    vue.component('SoraWallet', SoraWallet) // Root component
  }
}

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(SoraWalletElements, {})
}

async function initWallet ({
  withoutStore = false,
  permissions
}: WALLET_CONSTS.WalletInitOptions = {}): Promise<void> {
  isWalletLoaded = false
  if (!withoutStore && !store) {
    await delay()
    return await initWallet({ withoutStore, permissions })
  } else {
    if (withoutStore) {
      store = internalStore
    }
    if (connection.loading) {
      await delay()
      return await initWallet({ withoutStore, permissions })
    }
    if (!connection.api) {
      await connection.open()
      console.info('Connected to blockchain', connection.endpoint)
    }
    if (permissions) {
      store.dispatch('setPermissions', permissions)
    }
    try {
      await api.initialize()
    } catch (error) {
      console.error('Something went wrong during api initialization', error)
      throw error
    }
    await store.dispatch('updateNetworkFees')
    await store.dispatch('getWhitelist')
    await store.dispatch('subscribeOnFiatPriceAndApyObjectUpdates')
    await store.dispatch('checkSigner')
    await store.dispatch('syncWithStorage')
    await store.dispatch('getAccountAssets')
    await store.dispatch('updateAccountAssets')
    subscribeStoreToStorageUpdates(store)
    isWalletLoaded = true
  }
}

const components = {
  SoraWallet,
  WalletAvatar,
  InfoLine,
  FormattedAmount,
  FormattedAmountWithFiatValue
}

const mixins = {
  NumberFormatterMixin,
  FormattedAmountMixin
}

export {
  initWallet,
  isWalletLoaded,
  en,
  api,
  connection,
  storage,
  getExplorerLinks,
  WALLET_CONSTS,
  components,
  mixins
}
export default SoraWalletElements
