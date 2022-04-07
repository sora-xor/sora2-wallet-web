import store from '../store';
import { WalletModules } from './wallet';
import type {
  WalletCommitDecorators,
  WalletDispatchDecorators,
  WalletGettersDecorators,
  WalletStateDecorators,
} from './types';
import { VuexOperation, createDecoratorsObject } from './util';

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
const getter = walletGetter.wallet;
const mutation = walletMutation.wallet;
const action = walletAction.wallet;

export { state, getter, mutation, action };
