import Vuex from 'vuex';
import { shallowMount } from '@vue/test-utils';

import WalletAssetDetails from '@/components/WalletAssetDetails.vue';
import { useDescribe, localVue } from '../../utils';
import { MOCK_ACCOUNT_ASSETS, MOCK_FIAT_PRICE_AND_APY_OBJECT, MOCK_HISTORY } from '../../utils/mock';
import { MOCK_ACCOUNT } from '../../utils/WalletAccountMock';

const createStore = (isNotXor = false) =>
  new Vuex.Store({
    getters: {
      accountAssets: () => MOCK_ACCOUNT_ASSETS,
      currentRouteParams: () => ({ asset: MOCK_ACCOUNT_ASSETS[Number(isNotXor)] }),
      activity: () => MOCK_HISTORY,
      fiatPriceAndApyObject: () => MOCK_FIAT_PRICE_AND_APY_OBJECT,
      account: () => MOCK_ACCOUNT,
    } as any,
  });

useDescribe('WalletAssetDetails.vue', WalletAssetDetails, () => {
  it('should be rendered correctly', () => {
    const wrapper = shallowMount(WalletAssetDetails, { localVue, store: createStore() });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('should show detailed balance info when button clicked', async () => {
    const wrapper = shallowMount(WalletAssetDetails, { localVue, store: createStore() });
    const el = wrapper.find('.asset-details-balance');

    await el.trigger('click');

    expect(wrapper.element).toMatchSnapshot();
  });

  it('should not show balance details button', () => {
    const isNotXorToken = true;
    const store = createStore(isNotXorToken);
    const wrapper = shallowMount(WalletAssetDetails, { localVue, store });
    const btnBalanceDetails = wrapper.find('.asset-details-balance--clickable');

    expect(btnBalanceDetails.exists()).toBeFalse();
  });
});
