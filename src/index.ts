import Vue from 'vue'

import {
  WalletConnection
} from './components'
import { Components } from './types/components'
import en from './lang/en'

const components = [
  { component: WalletConnection, name: Components.WalletConnection }
]

const SoraNeoWallet = {
  install (vue: typeof Vue): void {
    components.forEach(el => vue.component(el.name, el.component))
  }
}

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(SoraNeoWallet, {})
}

export {
  en,
  WalletConnection
}
export default SoraNeoWallet
