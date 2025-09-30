import TransactionHashView from '@/components/TransactionHashView.vue';
import { SoraNetwork, HashType } from '@/consts';

import { useDescribe, useShallowMount, useVuex } from '../../utils';
import { MOCK_TRANSACTION_HASH_VIEW } from '../../utils/TransactionHashViewMock';

const createStore = () => useVuex();

vi.mock('../../../src/util', async () => {
  const originalModule = await vi.importActual<typeof import('../../../src/util')>('../../../src/util');

  return {
    ...originalModule,
    formatAccountAddress: (value) => value,
  };
});

useDescribe('TransactionHashView.vue', TransactionHashView, () => {
  const formattedAddressLength = 24;
  const ellipsisLength = 3;
  const totalLength = formattedAddressLength + ellipsisLength;

  MOCK_TRANSACTION_HASH_VIEW.map((item) =>
    it(`[type: ${item.type}, env: ${SoraNetwork.Dev}]: should be rendered correctly`, async () => {
      const wrapper = useShallowMount(TransactionHashView, {
        propsData: item,
        store: createStore(),
      });
      wrapper.vm.$store.state.wallet.settings.soraNetwork = SoraNetwork.Dev;
      await wrapper.vm.$nextTick();
      let expectedLinksCount = 0;
      switch (item.type) {
        case HashType.EthAccount:
        case HashType.EthTransaction:
        case HashType.Block:
          expectedLinksCount = 1;
          break;
        case HashType.ID:
          expectedLinksCount = item.block ? 1 : 0;
          break;
        default:
          expectedLinksCount = 0;
      }
      const txLinks = wrapper
        .findAll('.s-input-container .transaction-link')
        .map((node) => node.element as HTMLAnchorElement);
      const txInputValue = wrapper.find('.s-input-container s-input-stub').attributes('value') ?? '';
      expect(wrapper.element).toMatchSnapshot();
      expect(txLinks.length).toBe(expectedLinksCount);
      expect(txInputValue.length).toBe(totalLength);
    })
  );

  MOCK_TRANSACTION_HASH_VIEW.map((item) =>
    it(`[type: ${item.type}, env: ${SoraNetwork.Prod}]: should be rendered correctly`, async () => {
      const wrapper = useShallowMount(TransactionHashView, {
        propsData: item,
        store: createStore(),
      });
      wrapper.vm.$store.state.wallet.settings.soraNetwork = SoraNetwork.Prod;
      await wrapper.vm.$nextTick();
      let expectedLinksCount = 0;
      switch (item.type) {
        case HashType.EthAccount:
        case HashType.EthTransaction:
          expectedLinksCount = 1;
          break;
        case HashType.Block:
          expectedLinksCount = 1;
          break;
        case HashType.ID:
          expectedLinksCount = item.block ? 1 : 0;
          break;
        default:
          expectedLinksCount = 0;
      }
      const txLinks = wrapper
        .findAll('.s-input-container .transaction-link')
        .map((node) => node.element as HTMLAnchorElement);
      const txInputValue = wrapper.find('.s-input-container s-input-stub').attributes('value') ?? '';
      expect(wrapper.element).toMatchSnapshot();
      expect(txLinks.length).toBe(expectedLinksCount);
      expect(txInputValue.length).toBe(totalLength);
    })
  );
});
