import Vue from 'vue';

import { install as installMaska } from './maska';
import { install as installSoramitsuUI } from './soramitsuUI';
import { install as installVirtualScroller } from './virtualScroller';
import './days-js-duration';

export default function installWalletPlugins(vue: typeof Vue, store) {
  installMaska(vue);
  installVirtualScroller(vue);
  installSoramitsuUI(vue, store);
}
