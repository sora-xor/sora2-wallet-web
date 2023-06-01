import TransactionHashView from '@/components/TransactionHashView.vue';
import { SoraNetwork, HashType } from '@/consts';

import { useDescribe, useShallowMount, useVuex } from '../../utils';
import { MOCK_TRANSACTION_HASH_VIEW } from '../../utils/TransactionHashViewMock';

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
      let expectedLinksCount = HashType.Account === item.type ? 0 : 1;
      if (item.type === HashType.ID && !item.block) {
        expectedLinksCount = 0;
      }
      const txLinks = wrapper
        .findAll('.s-input-container .transaction-link')
        .wrappers.map((item) => item.element) as Array<HTMLAnchorElement>;
      const txInputValue = wrapper.find('.s-input-container s-input-stub').props().value as string;
      expect(wrapper.element).toMatchSnapshot();
      expect(txLinks.length).toBe(expectedLinksCount);
      expect(txInputValue.length).toBe(formattedAddressLength + ellipsisLength);
    })
  );

  MOCK_TRANSACTION_HASH_VIEW.map((item) =>
    it(`[type: ${item.type}, env: ${SoraNetwork.Prod}]: should be rendered correctly`, () => {
      const wrapper = useShallowMount(TransactionHashView, {
        propsData: item,
        store: createStore(SoraNetwork.Prod),
      });
      let expectedLinksCount = [HashType.EthAccount, HashType.EthTransaction, HashType.Account].includes(item.type)
        ? 1
        : 2;
      if (item.type === HashType.ID && !item.block) {
        expectedLinksCount = 1;
      }
      const txLinks = wrapper
        .findAll('.s-input-container .transaction-link')
        .wrappers.map((item) => item.element) as Array<HTMLAnchorElement>;
      const txInputValue = wrapper.find('.s-input-container s-input-stub').props().value as string;
      expect(wrapper.element).toMatchSnapshot();
      expect(txLinks.length).toBe(expectedLinksCount);
      expect(txInputValue.length).toBe(formattedAddressLength + ellipsisLength);
    })
  );
});
