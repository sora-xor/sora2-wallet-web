import Vue from 'vue'
import { Store } from 'vuex'
import debounce from 'lodash/fp/debounce'

import { install } from './plugins'
// import './styles' We don't need it for now

import SoraNeoWallet from './SoraNeoWallet.vue'
import WalletAvatar from './components/WalletAvatar.vue'
import { Components, Modules } from './types'
import en from './lang/en'
import internalStore, { modules } from './store' // `internalStore` is required for local usage
import { updateAccountAssetsSubscription } from './store/Account'
import { storage } from './util/storage'
import { api, connection } from './api'
import { delay, getExplorerLink } from './util'
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

const components = [
  { component: SoraNeoWallet, name: Components.SoraNeoWallet }
]

const SoraNeoWalletElements = {
  install (vue: typeof Vue, options: any): void {
    if (!options.store) {
      throw new Error('Please provide vuex store.')
    }
    Object.values(Modules).forEach(molude => {
      options.store.registerModule(molude, modules[molude])
    })
    store = options.store
    install(store)
    components.forEach(el => vue.component(el.name, el.component))
  }
}

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(SoraNeoWalletElements, {})
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
    api.initialize()
    await store.dispatch('getWhitelist')
    await store.dispatch('checkSigner')
    await store.dispatch('syncWithStorage')
    await store.dispatch('getAccountAssets')
    await store.dispatch('updateAccountAssets')
    subscribeStoreToStorageUpdates(store)
    isWalletLoaded = true
  }
}

export {
  initWallet,
  isWalletLoaded,
  en,
  api,
  connection,
  storage,
  getExplorerLink,
  updateAccountAssetsSubscription,
  SoraNeoWallet,
  WALLET_CONSTS,
  WalletAvatar,
  store as externalStore // only for soraNetwork getter in wallet
}
export default SoraNeoWalletElements
