import Vuex from 'vuex';
import { shallowMount } from '@vue/test-utils';
import { useDescribe, localVue } from '../../utils';

import WalletAssetDetails from '@/components/WalletAssetDetails.vue';
import { MOCK_ACCOUNT_ASSETS, MOCK_FIAT_PRICE_AND_APY_OBJECT, MOCK_HISTORY } from '../../utils/mock';
import { MOCK_ACCOUNT } from '../../utils/WalletAccountMock';

const createStore = (isNotXor = false) =>
  new Vuex.Store({
    getters: {
      accountAssets: () => MOCK_ACCOUNT_ASSETS,
      currentRouteParams: () => ({ asset: MOCK_ACCOUNT_ASSETS[Number(isNotXor) | 0] }),
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

  describe('when token is XOR and button balance details clicked', () => {
    it('should show detailed balance info', async () => {
      const wrapper = shallowMount(WalletAssetDetails, { localVue, store: createStore() });
      const el = wrapper.find('.asset-details-balance');

      await el.trigger('click');

      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('when token is not XOR', () => {
    it('should not show balance details button', () => {
      const isNotXorToken = true;
      const store = createStore(isNotXorToken);
      const wrapper = shallowMount(WalletAssetDetails, { localVue, store });
      const btnBalanceDetails = wrapper.find('.asset-details-balance--clickable');

      expect(btnBalanceDetails.exists()).toBeFalse();
    });
  });
});
