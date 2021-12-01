import Vuex from 'vuex';
import { shallowMount, mount } from '@vue/test-utils';
import { Account } from '@/types/common';
import { History, TransactionStatus } from '@sora-substrate/util';

import WalletHistory from '@/components/WalletHistory.vue';
import { useDescribe, localVue, i18n } from '../../utils';
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
      i18n,
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('should render history empty text when no transacion', () => {
    const wrapper = shallowMount(WalletHistory, { localVue, store: createStore(), i18n });
    const textMessage = wrapper.find('.history-empty');

    expect(textMessage.exists()).toBeTrue();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('asset should be readable when passed as prop', () => {
    const wrapper = shallowMount(WalletHistory, {
      localVue,
      store: createStore(MOCK_HISTORY),
      i18n,
      propsData: { asset: MOCK_ACCOUNT_ASSETS[0] },
    });

    expect(wrapper.vm.$props.asset).toEqual(MOCK_ACCOUNT_ASSETS[0]);
  });

  it('should render spinner when transaction is pending', () => {
    const wrapper = mount(WalletHistory, {
      localVue,
      store: createStore([{ ...MOCK_HISTORY[0], status: TransactionStatus.InBlock }]),
      i18n,
      propsData: { asset: MOCK_ACCOUNT_ASSETS[0] },
    });
    const pendingIcon = wrapper.find('.info-status--loading');

    expect(pendingIcon.exists()).toBeTrue();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('should render error icon when transaction is failed', () => {
    const wrapper = mount(WalletHistory, {
      localVue,
      store: createStore([{ ...MOCK_HISTORY[0], status: TransactionStatus.Error }]),
      i18n,
      propsData: { asset: MOCK_ACCOUNT_ASSETS[0] },
    });
    const errorIcon = wrapper.find('.info-status--error');

    expect(errorIcon.exists()).toBeTrue();
    expect(wrapper.element).toMatchSnapshot();
  });
});
