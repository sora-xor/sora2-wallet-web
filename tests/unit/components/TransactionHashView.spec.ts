import { useDescribe, useShallowMount, useVuex } from '../../utils';
import { MOCK_TRANSACTION_HASH_VIEW } from '../../utils/TransactionHashViewMock';

import TransactionHashView from '@/components/TransactionHashView.vue';
import { SoraNetwork, HashType } from '@/consts';

const createStore = (env: SoraNetwork) =>
  useVuex({
    settings: {
      state: () => ({
        soraNetwork: env,
      }),
    },
  });

useDescribe('TransactionHashView.vue', TransactionHashView, () => {
  const formattedAddressLength = 24;
  const ellipsisLength = 3;

  MOCK_TRANSACTION_HASH_VIEW.map((item) =>
    it(`[type: ${item.type}, env: ${SoraNetwork.Dev}]: should be rendered correctly`, () => {
      const wrapper = useShallowMount(TransactionHashView, {
        propsData: item,
        store: createStore(SoraNetwork.Dev),
      });
      const expectedLinks = [HashType.EthAccount, HashType.EthTransaction].includes(item.type) ? 0 : 1;
      const txLinks = wrapper
        .findAll('.s-input-container .transaction-link')
        .wrappers.map((item) => item.element) as Array<HTMLAnchorElement>;
      const txInputValue = wrapper.find('.s-input-container s-input-stub').props().value as string;
      expect(wrapper.element).toMatchSnapshot();
      expect(txLinks.length).toBe(expectedLinks);
      expect(txInputValue.length).toBe(formattedAddressLength + ellipsisLength);
    })
  );

  MOCK_TRANSACTION_HASH_VIEW.map((item) =>
    it(`[type: ${item.type}, env: ${SoraNetwork.Prod}]: should be rendered correctly`, () => {
      const wrapper = useShallowMount(TransactionHashView, {
        propsData: item,
        store: createStore(SoraNetwork.Prod),
      });
      const expectedLinks = [HashType.EthAccount, HashType.EthTransaction].includes(item.type) ? 0 : 2;
      const txLinks = wrapper
        .findAll('.s-input-container .transaction-link')
        .wrappers.map((item) => item.element) as Array<HTMLAnchorElement>;
      const txInputValue = wrapper.find('.s-input-container s-input-stub').props().value as string;
      expect(wrapper.element).toMatchSnapshot();
      expect(txLinks.length).toBe(expectedLinks);
      expect(txInputValue.length).toBe(formattedAddressLength + ellipsisLength);
    })
  );
});
