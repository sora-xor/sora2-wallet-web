import Vuex from 'vuex';
import { shallowMount } from '@vue/test-utils';

import WalletAssets from '@/components/WalletAssets.vue';
import { AccountAsset } from '@sora-substrate/util';
import { useDescribe, localVue } from '../../utils';
import { MOCK_ACCOUNT_ASSETS, MOCK_FIAT_PRICE_AND_APY_OBJECT, MOCK_WALLET_PERMISSIONS } from '../../utils/mock';
import { WalletPermissions } from '../../../src/consts';
import type { FiatPriceAndApyObject } from '../../../src/services/types';

const createStore = (permissions: WalletPermissions = MOCK_WALLET_PERMISSIONS, withoutFiatAndApy = false) =>
  new Vuex.Store({
    getters: {
      accountAssets: () => MOCK_ACCOUNT_ASSETS as Array<AccountAsset>,
      fiatPriceAndApyObject: () => MOCK_FIAT_PRICE_AND_APY_OBJECT as FiatPriceAndApyObject,
      withoutFiatAndApy: () => withoutFiatAndApy,
      permissions: () => permissions,
    },
  });

useDescribe('WalletAssets.vue', WalletAssets, () => {
  it('should be rendered correctly', () => {
    const wrapper = shallowMount(WalletAssets, { localVue, store: createStore() });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('should not render send button when sendAssets property is false', () => {
    const wrapper = shallowMount(WalletAssets, {
      localVue,
      store: createStore({ ...MOCK_WALLET_PERMISSIONS, sendAssets: false }),
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('should not render swap button when swapAssets property is false', () => {
    const wrapper = shallowMount(WalletAssets, {
      localVue,
      store: createStore({ ...MOCK_WALLET_PERMISSIONS, swapAssets: false }),
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('should not render fiat value when withoutFiatAndApy property is true', () => {
    const wrapper = shallowMount(WalletAssets, {
      localVue,
      store: createStore(undefined, true),
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
