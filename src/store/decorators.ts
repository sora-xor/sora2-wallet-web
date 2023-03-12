import type { VueDecorator } from 'vue-class-component';

import store from '../store';
import { WalletModules } from './wallet';
import { VuexOperation, createDecoratorsObject, attachDecorator } from './util';
import type {
  WalletCommitDecorators,
  WalletDispatchDecorators,
  WalletGettersDecorators,
  WalletStateDecorators,
} from './types';

const walletState = {} as WalletStateDecorators;
const walletGetter = {} as WalletGettersDecorators;
const walletMutation = {} as WalletCommitDecorators;
const walletAction = {} as WalletDispatchDecorators;

(function initWalletDecorators(): void {
  createDecoratorsObject(store.state, walletState, WalletModules, VuexOperation.State);
  createDecoratorsObject(store.getters, walletGetter, WalletModules, VuexOperation.Getter);
  createDecoratorsObject(store.commit, walletMutation, WalletModules, VuexOperation.Mutation);
  createDecoratorsObject(store.dispatch, walletAction, WalletModules, VuexOperation.Action);
})();

const state = walletState.wallet;
const getter = walletGetter.wallet as typeof walletGetter.wallet & {
  libraryDesignSystem: VueDecorator;
  libraryTheme: VueDecorator;
};
const mutation = walletMutation.wallet;
const action = walletAction.wallet;

// Add Design System getters
getter.libraryDesignSystem = attachDecorator(VuexOperation.Getter, 'libraryDesignSystem');
getter.libraryTheme = attachDecorator(VuexOperation.Getter, 'libraryTheme');

export { state, getter, mutation, action };
