import Vue from 'vue'
import { install as installSoramitsuUI } from './soramitsuUI'
import { install as installMaska } from './maska'

export default function installWalletPlugins (vue: typeof Vue, store) {
  installMaska(vue)
  installSoramitsuUI(vue, store)
}
