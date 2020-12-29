import Vue from 'vue'
import { Store } from 'vuex'

import SoraNeoWallet from './SoraNeoWallet.vue'
import { Components, Modules } from './types'
import en from './lang/en'
import internalStore, { modules } from './store' // `internalStore` is required for local usage
import { storage } from './util/storage'
import { dexApi } from './api'

let store: Store<unknown>
let isWalletLoaded = false

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
    components.forEach(el => vue.component(el.name, el.component))
  }
}

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(SoraNeoWalletElements, {})
}

async function initWallet (withoutStore = false): Promise<void> {
  isWalletLoaded = false
  if (!withoutStore && !store) {
    await new Promise(resolve => setTimeout(resolve, 50))
    return await initWallet(withoutStore)
  } else {
    if (withoutStore) {
      store = internalStore
    }
    if (!(dexApi.api && dexApi.api.isConnected)) {
      await dexApi.initialize()
      console.info('Connected to blockchain', dexApi.endpoint)
    }
    if (!store.getters.isLoggedIn) {
      isWalletLoaded = true
      return
    }
    if (store.getters.isExternal) {
      await store.dispatch('getSigner')
    }
    await store.dispatch('getAccountAssets')
    await store.dispatch('updateAccountAssets')
    isWalletLoaded = true
  }
}

export {
  initWallet,
  isWalletLoaded,
  en,
  dexApi,
  storage,
  SoraNeoWallet
}
export default SoraNeoWalletElements
