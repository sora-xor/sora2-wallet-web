import AssetDetailsTransferable from '@/components/AssetDetails/AssetDetailsTransferable.vue';

import { useDescribe, useShallowMount, useVuex } from '../../utils';
import { MOCK_ACCOUNT_ASSETS, MOCK_FIAT_PRICE_OBJECT, MOCK_HISTORY, MOCK_WALLET_PERMISSIONS } from '../../utils/mock';
import { MOCK_ACCOUNT } from '../../utils/WalletAccountMock';

const createStore = ({ permissions = MOCK_WALLET_PERMISSIONS, isNotXor = false } = {}) =>
  useVuex({
    settings: {
      state: () => ({
        permissions,
      }),
    },
    router: {
      state: () => ({
        currentRouteParams: { asset: MOCK_ACCOUNT_ASSETS[Number(isNotXor)] },
      }),
    },
    account: {
      state: () => ({
        accountAssets: MOCK_ACCOUNT_ASSETS,
        fiatPriceObject: MOCK_FIAT_PRICE_OBJECT,
      }),
      getters: {
        account: () => MOCK_ACCOUNT,
      },
    },
    transactions: {
      state: () => ({
        history: MOCK_HISTORY,
      }),
      getters: {
        selectedTx: () => null,
      },
    },
  });

useDescribe('WalletAssetDetails.vue', AssetDetailsTransferable, () => {
  it('should be rendered correctly', () => {
    const wrapper = useShallowMount(AssetDetailsTransferable, { store: createStore() });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('should show detailed balance info when button clicked', async () => {
    const wrapper = useShallowMount(AssetDetailsTransferable, { store: createStore() });
    const el = wrapper.find('.asset-details-balance');

    await el.trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  it('should not show balance details button', () => {
    const isNotXor = true;
    const store = createStore({ isNotXor });
    const wrapper = useShallowMount(AssetDetailsTransferable, { store });
    const btnBalanceDetails = wrapper.find('.asset-details-balance--clickable');

    expect(btnBalanceDetails.exists()).toBeFalse();
  });

  it('should not show send action button', () => {
    const store = createStore({ permissions: { ...MOCK_WALLET_PERMISSIONS, sendAssets: false } });
    const wrapper = useShallowMount(AssetDetailsTransferable, { store });
    const btn = wrapper.find('.asset-details-action.send');

    expect(btn.exists()).toBeFalse();
  });

  it('should not show bridge action button', () => {
    const store = createStore({ permissions: { ...MOCK_WALLET_PERMISSIONS, bridgeAssets: false } });
    const wrapper = useShallowMount(AssetDetailsTransferable, { store });
    const btn = wrapper.find('.asset-details-action.bridge');

    expect(btn.exists()).toBeFalse();
  });

  it('should not show swap action button', () => {
    const store = createStore({ permissions: { ...MOCK_WALLET_PERMISSIONS, swapAssets: false } });
    const wrapper = useShallowMount(AssetDetailsTransferable, { store });
    const btn = wrapper.find('.asset-details-action.swap');

    expect(btn.exists()).toBeFalse();
  });

  it('should not show liquidity action button', () => {
    const store = createStore({ permissions: { ...MOCK_WALLET_PERMISSIONS, addLiquidity: false } });
    const wrapper = useShallowMount(AssetDetailsTransferable, { store });
    const btn = wrapper.find('.asset-details-action.liquidity');

    expect(btn.exists()).toBeFalse();
  });

  it('should not show bridge action button', () => {
    const store = createStore({ permissions: { ...MOCK_WALLET_PERMISSIONS, bridgeAssets: false } });
    const wrapper = useShallowMount(AssetDetailsTransferable, { store });
    const btn = wrapper.find('.asset-details-action.bridge');

    expect(btn.exists()).toBeFalse();
  });
});
