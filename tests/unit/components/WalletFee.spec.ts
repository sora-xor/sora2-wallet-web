import WalletFee from '@/components/WalletFee.vue';

import { useDescribe, useShallowMount, useVuex } from '../../utils';
import { MOCK_WALLET_FEE } from '../../utils/WalletFeeMock';
import { MOCK_FIAT_PRICE_OBJECT } from '../../utils/mock';

const createStore = () =>
  useVuex({
    account: {
      state: () => ({
        fiatPriceObject: MOCK_FIAT_PRICE_OBJECT,
      }),
    },
  });

useDescribe('WalletFee.vue', WalletFee, () => {
  const store = createStore();

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
