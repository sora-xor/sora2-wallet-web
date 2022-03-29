import Vuex from 'vuex';
import { TransactionStatus, AccountHistory, HistoryItem } from '@sora-substrate/util';

import WalletHistory from '@/components/WalletHistory.vue';
import { useDescribe, useShallowMount, useMount } from '../../utils';
import { MOCK_ACCOUNT_ASSETS, MOCK_ACCOUNT_HISTORY, MOCK_EXTERNAL_HISTORY, MOCK_ASSETS } from '../../utils/mock';
import { MOCK_ACCOUNT } from '../../utils/WalletAccountMock';
import type { Account } from '@/types/common';

const createStore = ({ history = {}, externalHistory = {} } = {}) => {
  return new Vuex.Store({
    getters: {
      assets: () => MOCK_ASSETS,
      account: () => MOCK_ACCOUNT as Account,
      history: () => history as AccountHistory<HistoryItem>,
      externalHistory: () => externalHistory as AccountHistory<HistoryItem>,
      externalHistoryTotal: () => 4,
      shouldBalanceBeHidden: () => true as boolean,
    },
    actions: {
      getAssets: jest.fn(),
      getAccountHistory: jest.fn(),
      getExternalHistory: jest.fn(),
      resetExternalHistory: jest.fn(),
      navigate: jest.fn(),
    },
  });
};

useDescribe('WalletHistory.vue', WalletHistory, () => {
  it('should be rendered correctly', () => {
    const wrapper = useShallowMount(WalletHistory, {
      store: createStore({
        history: MOCK_ACCOUNT_HISTORY,
        externalHistory: MOCK_EXTERNAL_HISTORY,
      }),
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('should render history empty text when no transacion', () => {
    const wrapper = useShallowMount(WalletHistory, {
      store: createStore(),
    });
    const textMessage = wrapper.find('.history-empty');

    expect(textMessage.exists()).toBeTrue();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('asset should be readable when passed as prop', () => {
    const wrapper = useShallowMount(WalletHistory, {
      store: createStore({
        history: MOCK_ACCOUNT_HISTORY,
        externalHistory: MOCK_EXTERNAL_HISTORY,
      }),
      propsData: { asset: MOCK_ACCOUNT_ASSETS[0] },
    });

    expect(wrapper.vm.$props.asset).toEqual(MOCK_ACCOUNT_ASSETS[0]);
  });

  it('should render spinner when transaction is pending', () => {
    const pendingItem = {
      ...(Object.values(MOCK_ACCOUNT_HISTORY)[0] as HistoryItem),
      status: TransactionStatus.Broadcast,
    };

    const wrapper = useMount(WalletHistory, {
      store: createStore({
        history: {
          ...MOCK_ACCOUNT_HISTORY,
          [pendingItem.id as string]: pendingItem,
        },
        externalHistory: MOCK_EXTERNAL_HISTORY,
      }),
      propsData: { asset: MOCK_ACCOUNT_ASSETS[0] },
    });
    const pendingIcon = wrapper.find('.info-status--loading');

    expect(pendingIcon.exists()).toBeTrue();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('should render error icon when transaction is failed', () => {
    const errorItem = {
      ...(Object.values(MOCK_ACCOUNT_HISTORY)[0] as HistoryItem),
      status: TransactionStatus.Error,
    };

    const wrapper = useMount(WalletHistory, {
      store: createStore({
        history: {
          ...MOCK_ACCOUNT_HISTORY,
          [errorItem.id as string]: errorItem,
        },
        externalHistory: MOCK_EXTERNAL_HISTORY,
      }),
      propsData: { asset: MOCK_ACCOUNT_ASSETS[0] },
    });
    const errorIcon = wrapper.find('.info-status--error');

    expect(errorIcon.exists()).toBeTrue();
    expect(wrapper.element).toMatchSnapshot();
  });
});
