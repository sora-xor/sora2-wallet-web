import Vuex from 'vuex';

import { useDescribe, useShallowMount } from '../../utils';
import { MOCK_FIAT_PRICE_AND_APY_OBJECT } from '../../utils/mock';
import { MOCK_WALLET_FEE } from '../../utils/WalletFeeMock';

import WalletFee from '@/components/WalletFee.vue';

useDescribe('WalletFee.vue', WalletFee, () => {
  const store = new Vuex.Store({
    getters: {
      fiatPriceAndApyObject: () => MOCK_FIAT_PRICE_AND_APY_OBJECT,
    },
  });
  MOCK_WALLET_FEE.map((item) =>
    it(`[${item.title}]: should be rendered correctly`, () => {
      const propsData = {
        value: item.value,
      };
      const wrapper = useShallowMount(WalletFee, {
        store,
        propsData,
      });
      expect(wrapper.element).toMatchSnapshot();
    })
  );
  it('Should not be rendered', () => {
    const propsData = {
      value: '123',
    };
    try {
      useShallowMount(WalletFee, { store, propsData });
    } catch (error) {
      expect((error as Error).message).toBe('[WalletFee.vue]: property "value" should have FPNumber type');
    }
  });
});
