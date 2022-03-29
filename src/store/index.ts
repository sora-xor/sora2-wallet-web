import Vue from 'vue';
import Vuex from 'vuex';
import { createDirectStore } from 'direct-vuex';
import type { Store } from 'vuex';

import wallet, { WalletModule } from './wallet';

Vue.use(Vuex);

// To enable types in the injected store '$store'.
export type AppStore = typeof store;
declare module 'vuex' {
  interface Store<S> {
    direct: AppStore;
  }
}

const modules = {
  wallet,
};

export type WalletStore = Store<typeof modules>;

const { store, rootActionContext, rootGetterContext } = createDirectStore({
  modules,
  strict: false,
});

/**
 * This method is used only for submodules in wallet
 * @param submodule name of submodule
 * @returns the same as localActionContext
 */
const prepareWalletActionContext = (context: any, submodule: WalletModule) => {
  const { rootCommit, rootDispatch, rootGetters, rootState } = rootActionContext(context);
  return {
    state: rootState.wallet[submodule],
    getters: rootGetters.wallet[submodule],
    commit: rootCommit.wallet[submodule],
    dispatch: rootDispatch.wallet[submodule],
  };
};

export { modules, rootActionContext, rootGetterContext, prepareWalletActionContext };

export default store;
