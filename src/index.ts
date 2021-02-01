import Vue from 'vue'
import { Store } from 'vuex'

import SoraNeoWallet from './SoraNeoWallet.vue'
import { Components, Modules } from './types'
import en from './lang/en'
import internalStore, { modules } from './store' // `internalStore` is required for local usage
import { storage } from './util/storage'
import { dexApi, connection } from './api'
import { delay } from './util'

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
    await delay()
    return await initWallet(withoutStore)
  } else {
    if (withoutStore) {
      store = internalStore
    }
    if (connection.loading) {
      await delay()
      return await initWallet(withoutStore)
    }
    if (!connection.api) {
      await connection.open()
      console.info('Connected to blockchain', connection.endpoint)
    }
    dexApi.initialize()
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
  connection,
  storage,
  SoraNeoWallet
}
export default SoraNeoWalletElements
