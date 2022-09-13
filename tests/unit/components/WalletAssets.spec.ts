import WalletAssets from '@/components/WalletAssets.vue';

import { useDescribe, useShallowMount, useVuex } from '../../utils';
import {
  MOCK_ACCOUNT_ASSETS,
  MOCK_FIAT_PRICE_AND_APY_OBJECT,
  MOCK_WALLET_PERMISSIONS,
  MOCK_WHITE_LIST,
} from '../../utils/mock';
import { WalletPermissions } from '../../../src/consts';

const createWrapper = (options = {}) =>
  useShallowMount(WalletAssets, {
    ...options,
  });

const createStore = (permissions: WalletPermissions = MOCK_WALLET_PERMISSIONS, withoutFiatAndApy = false) =>
  useVuex({
    settings: {
      state: () => ({
        permissions,
        shouldBalanceBeHidden: false,
        filters: {
          option: 'All',
          verifiedOnly: false,
          zeroBalance: false,
        },
      }),
    },
    account: {
      state: () => ({
        accountAssets: MOCK_ACCOUNT_ASSETS,
        fiatPriceAndApyObject: MOCK_FIAT_PRICE_AND_APY_OBJECT,
        withoutFiatAndApy,
      }),
      getters: {
        whitelist: () => MOCK_WHITE_LIST,
      },
    },
    router: {
      mutations: {
        navigate: jest.fn(),
      },
    },
  });

useDescribe('WalletAssets.vue', WalletAssets, () => {
  it('should be rendered correctly', () => {
    // const wrapper = useShallowMount(WalletAssets, { store: createStore() });

    const wrapper = createWrapper({
      store: createStore(),
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('should not render send button when sendAssets property is false', () => {
    const wrapper = createWrapper({
      store: createStore({ ...MOCK_WALLET_PERMISSIONS, sendAssets: false }),
    });
    const sendBtn = wrapper.find('.send');

    expect(sendBtn.exists()).toBeFalse();
  });

  it('should not render swap button when swapAssets property is false', () => {
    const wrapper = createWrapper({
      store: createStore({ ...MOCK_WALLET_PERMISSIONS, swapAssets: false }),
    });
    const swapBtn = wrapper.find('.swap');

    expect(swapBtn.exists()).toBeFalse();
  });

  it('should not render asset details button when showAssetDetails property is false', () => {
    const wrapper = createWrapper({
      store: createStore({ ...MOCK_WALLET_PERMISSIONS, showAssetDetails: false }),
    });
    const detailsBtn = wrapper.find('.el-button--details');

    expect(detailsBtn.exists()).toBeFalse();
  });

  it('should not render add assets button when addAssets property is false', () => {
    const wrapper = createWrapper({
      store: createStore({ ...MOCK_WALLET_PERMISSIONS, addAssets: false }),
    });
    const addAssetsBtn = wrapper.find('.wallet-assets-add');

    expect(addAssetsBtn.exists()).toBeFalse();
  });

  it('should not render fiat value when withoutFiatAndApy property is true', () => {
    const wrapper = createWrapper({
      store: createStore(undefined, true),
    });
    const fiatValue = wrapper.find('.wallet-assets--fiat');

    expect(fiatValue.exists()).toBeFalse();
  });
});
