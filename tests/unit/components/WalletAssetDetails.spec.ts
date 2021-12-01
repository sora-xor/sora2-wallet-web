import Vuex from 'vuex';

import WalletAssetDetails from '@/components/WalletAssetDetails.vue';
import { useDescribe, useShallowMount } from '../../utils';
import {
  MOCK_ACCOUNT_ASSETS,
  MOCK_FIAT_PRICE_AND_APY_OBJECT,
  MOCK_HISTORY,
  MOCK_WALLET_PERMISSIONS,
} from '../../utils/mock';
import { MOCK_ACCOUNT } from '../../utils/WalletAccountMock';

const createStore = ({ permissions = MOCK_WALLET_PERMISSIONS, isNotXor = false } = {}) =>
  new Vuex.Store({
    getters: {
      accountAssets: () => MOCK_ACCOUNT_ASSETS,
      currentRouteParams: () => ({ asset: MOCK_ACCOUNT_ASSETS[Number(isNotXor)] }),
      activity: () => MOCK_HISTORY,
      fiatPriceAndApyObject: () => MOCK_FIAT_PRICE_AND_APY_OBJECT,
      account: () => MOCK_ACCOUNT,
      permissions: () => permissions,
    } as any,
  });

useDescribe('WalletAssetDetails.vue', WalletAssetDetails, () => {
  it('should be rendered correctly', () => {
    const wrapper = useShallowMount(WalletAssetDetails, { store: createStore() });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('should show detailed balance info when button clicked', async () => {
    const wrapper = useShallowMount(WalletAssetDetails, { store: createStore() });
    const el = wrapper.find('.asset-details-balance');

    await el.trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  it('should not show balance details button', () => {
    const isNotXor = true;
    const store = createStore({ isNotXor });
    const wrapper = useShallowMount(WalletAssetDetails, { store });
    const btnBalanceDetails = wrapper.find('.asset-details-balance--clickable');

    expect(btnBalanceDetails.exists()).toBeFalse();
  });

  it('should not show send action button', () => {
    const store = createStore({ permissions: { ...MOCK_WALLET_PERMISSIONS, sendAssets: false } });
    const wrapper = useShallowMount(WalletAssetDetails, { store });
    const btn = wrapper.find('.asset-details-action.send');

    expect(btn.exists()).toBeFalse();
  });

  it('should not show bridge action button', () => {
    const store = createStore({ permissions: { ...MOCK_WALLET_PERMISSIONS, bridgeAssets: false } });
    const wrapper = useShallowMount(WalletAssetDetails, { store });
    const btn = wrapper.find('.asset-details-action.bridge');

    expect(btn.exists()).toBeFalse();
  });

  it('should not show copy action button', () => {
    const store = createStore({ permissions: { ...MOCK_WALLET_PERMISSIONS, copyAssets: false } });
    const wrapper = useShallowMount(WalletAssetDetails, { store });
    const btn = wrapper.find('.asset-details-action.recieve');

    expect(btn.exists()).toBeFalse();
  });

  it('should not show swap action button', () => {
    const store = createStore({ permissions: { ...MOCK_WALLET_PERMISSIONS, swapAssets: false } });
    const wrapper = useShallowMount(WalletAssetDetails, { store });
    const btn = wrapper.find('.asset-details-action.swap');

    expect(btn.exists()).toBeFalse();
  });

  it('should not show liquidity action button', () => {
    const store = createStore({ permissions: { ...MOCK_WALLET_PERMISSIONS, addLiquidity: false } });
    const wrapper = useShallowMount(WalletAssetDetails, { store });
    const btn = wrapper.find('.asset-details-action.liquidity');

    expect(btn.exists()).toBeFalse();
  });

  it('should not show bridge action button', () => {
    const store = createStore({ permissions: { ...MOCK_WALLET_PERMISSIONS, bridgeAssets: false } });
    const wrapper = useShallowMount(WalletAssetDetails, { store });
    const btn = wrapper.find('.asset-details-action.bridge');

    expect(btn.exists()).toBeFalse();
  });
});
