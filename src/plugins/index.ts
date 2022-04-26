import Vue from 'vue';
import { install as installSoramitsuUI } from './soramitsuUI';
import { install as installMaska } from './maska';
import { install as installVirtualScroller } from './virtualScroller';

export default function installWalletPlugins(vue: typeof Vue, store) {
  installMaska(vue);
  installVirtualScroller(vue);
  installSoramitsuUI(vue, store);
}
