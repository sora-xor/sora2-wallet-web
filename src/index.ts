import Vue from 'vue'

import SoraNeoWallet from './SoraNeoWallet.vue'
import { Components, Modules } from './types'
import en from './lang/en'
import { modules } from './store'

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
    components.forEach(el => vue.component(el.name, el.component))
  }
}

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(SoraNeoWalletElements, {})
}

export {
  en,
  SoraNeoWallet
}
export default SoraNeoWalletElements
