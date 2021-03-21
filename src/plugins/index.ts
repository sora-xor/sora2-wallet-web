import { install as installSoramitsuUI } from './soramitsuUI'
import { install as installMaska } from './maska'

export function install (store) {
  installMaska()
  installSoramitsuUI(store)
}
