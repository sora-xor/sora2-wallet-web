import Vuex from 'vuex';
import { shallowMount } from '@vue/test-utils';

import { useDescribe, localVue, i18n } from '../../utils';
import { MOCK_TRANSACTION_HASH_VIEW } from '../../utils/TransactionHashViewMock';

import TransactionHashView from '@/components/TransactionHashView.vue';
import { SoraNetwork } from '@/consts';

const createStore = (env: SoraNetwork) =>
  new Vuex.Store({
    modules: {
      Settings: {
        getters: {
          soraNetwork: () => env,
        },
      },
    } as any,
  });

useDescribe('TransactionHashView.vue', TransactionHashView, () => {
  const formattedAddressLength = 24;
  const ellipsisLength = 3;

  MOCK_TRANSACTION_HASH_VIEW.map((item) =>
    it(`[type: ${item.type}, env: ${SoraNetwork.Dev}]: should be rendered correctly`, () => {
      const wrapper = shallowMount(TransactionHashView, {
        localVue,
        i18n,
        propsData: item,
        store: createStore(SoraNetwork.Dev),
      });
      const txLinks = wrapper
        .findAll('.s-input-container .transaction-link')
        .wrappers.map((item) => item.element) as Array<HTMLAnchorElement>;
      const txInputValue = wrapper.find('.s-input-container s-input-stub').props().value as string;
      expect(wrapper.element).toMatchSnapshot();
      expect(txLinks.length).toBe(1);
      expect(txInputValue.length).toBe(formattedAddressLength + ellipsisLength);
    })
  );

  MOCK_TRANSACTION_HASH_VIEW.map((item) =>
    it(`[type: ${item.type}, env: ${SoraNetwork.Prod}]: should be rendered correctly`, () => {
      const wrapper = shallowMount(TransactionHashView, {
        localVue,
        i18n,
        propsData: item,
        store: createStore(SoraNetwork.Prod),
      });
      const txLinks = wrapper
        .findAll('.s-input-container .transaction-link')
        .wrappers.map((item) => item.element) as Array<HTMLAnchorElement>;
      const txInputValue = wrapper.find('.s-input-container s-input-stub').props().value as string;
      expect(wrapper.element).toMatchSnapshot();
      expect(txLinks.length).toBe(2);
      expect(txInputValue.length).toBe(formattedAddressLength + ellipsisLength);
    })
  );
});
