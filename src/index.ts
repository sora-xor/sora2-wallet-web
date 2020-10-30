import Vue from 'vue'

import SoraNeoWallet from './SoraNeoWallet.vue'
import { Components } from './types/components'
import en from './lang/en'

const components = [
  { component: SoraNeoWallet, name: Components.SoraNeoWallet }
]

const SoraNeoWalletElements = {
  install (vue: typeof Vue): void {
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
