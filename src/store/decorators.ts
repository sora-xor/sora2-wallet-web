import { createDecorator, VueDecorator } from 'vue-class-component';
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex';

import store from '../store';
import type {
  WalletCommitDecorators,
  WalletDispatchDecorators,
  WalletGettersDecorators,
  WalletStateDecorators,
} from './types';

type VuexMap = typeof mapState | typeof mapGetters | typeof mapActions | typeof mapMutations;

export enum VuexOperation {
  State = 'state',
  Getter = 'getter',
  Mutation = 'mutation',
  Action = 'action',
}

export const walletModules = [
  'wallet/account',
  'wallet/router',
  'wallet/settings',
  'wallet/subscriptions',
  'wallet/transactions',
];

export function getVuexMapFn(type: VuexOperation) {
  switch (type) {
    case VuexOperation.State:
      return mapState;
    case VuexOperation.Getter:
      return mapGetters;
    case VuexOperation.Mutation:
      return mapMutations;
    case VuexOperation.Action:
      return mapActions;
  }
}

export function isComputedDecorator(type: VuexOperation): boolean {
  return [VuexOperation.State, VuexOperation.Getter].includes(type);
}

export function attachDecorator(type: VuexOperation, modulesChain: string, name: string): VueDecorator {
  const mapFn = getVuexMapFn(type);
  const featuresType = isComputedDecorator(type) ? 'computed' : 'methods';
  return createDecorator((options, key) => {
    let features = { ...options[featuresType] };
    if (!features) {
      features = {};
    }
    const mapObject = { [name]: name };
    features[key] = mapFn(modulesChain, mapObject)[name];
    options[featuresType] = features;
  });
}

function createDecoratorsObject(
  obj: any,
  newObj: any,
  modules: Array<string>,
  type: VuexOperation,
  path?: string
): void {
  let keys = Object.keys(obj);
  if (!keys.length) {
    // cuz Object.keys refers only to enumerable props
    keys = Object.getOwnPropertyNames(obj);
  }
  for (const key of keys) {
    const value = obj[key];
    if (path && modules.includes(path)) {
      newObj[key] = attachDecorator(type, path, key);
    } else {
      newObj[key] = {};
      createDecoratorsObject(value, newObj[key], modules, type, path ? `${path}/${key}` : key);
    }
  }
}

const walletState = {} as WalletStateDecorators;
const walletGetter = {} as WalletGettersDecorators;
const walletMutation = {} as WalletCommitDecorators;
const walletAction = {} as WalletDispatchDecorators;

(function initWalletDecorators(): void {
  createDecoratorsObject(store.state, walletState, walletModules, VuexOperation.State);
  createDecoratorsObject(store.getters, walletGetter, walletModules, VuexOperation.Getter);
  createDecoratorsObject(store.commit, walletMutation, walletModules, VuexOperation.Mutation);
  createDecoratorsObject(store.dispatch, walletAction, walletModules, VuexOperation.Action);
})();

const state = walletState.wallet;
const getter = walletGetter.wallet;
const mutation = walletMutation.wallet;
const action = walletAction.wallet;

export { state, getter, mutation, action };
