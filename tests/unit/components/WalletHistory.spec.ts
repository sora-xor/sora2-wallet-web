import Vuex from 'vuex';
import { shallowMount } from '@vue/test-utils';
import { Account } from '@/types/common';
import { History } from '@sora-substrate/util';

import WalletHistory from '@/components/WalletHistory.vue';
import { useDescribe, localVue } from '../../utils';
import { MOCK_ACCOUNT_ASSETS, MOCK_HISTORY } from '../../utils/mock';
import { MOCK_ACCOUNT } from '../../utils/WalletAccountMock';

const createStore = (historyArray?: Array<History> | undefined) => {
  return new Vuex.Store({
    getters: {
      account: () => MOCK_ACCOUNT as Account,
      activity: () => historyArray as Array<History>,
      shouldBalanceBeHidden: () => true as boolean,
    },
    actions: {
      getAccountActivity: jest.fn(),
    },
  });
};

useDescribe('WalletHistory.vue', WalletHistory, () => {
  it('should be rendered correctly', () => {
    const wrapper = shallowMount(WalletHistory, {
      localVue,
      store: createStore(MOCK_HISTORY),
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('should render history empty text when no transacion', () => {
    const wrapper = shallowMount(WalletHistory, { localVue, store: createStore() });
    const textMessage = wrapper.find('.history-empty');

    expect(textMessage.exists()).toBeTrue();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('asset should be readable when passed as prop', () => {
    const wrapper = shallowMount(WalletHistory, {
      localVue,
      store: createStore(MOCK_HISTORY),
      propsData: { asset: MOCK_ACCOUNT_ASSETS[0] },
    });

    expect(wrapper.vm.$props.asset).toEqual(MOCK_ACCOUNT_ASSETS[0]);
  });
});
