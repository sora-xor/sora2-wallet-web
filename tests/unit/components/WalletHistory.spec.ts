import Vuex from 'vuex';
import { TransactionStatus, AccountHistory, HistoryItem } from '@sora-substrate/util';

import WalletHistory from '@/components/WalletHistory.vue';
import { useDescribe, useShallowMount, useMount } from '../../utils';
import { MOCK_ACCOUNT_ASSETS, MOCK_ACCOUNT_ACTIVITY, MOCK_EXTERNAL_ACTIVITY, MOCK_ASSETS } from '../../utils/mock';
import { MOCK_ACCOUNT } from '../../utils/WalletAccountMock';
import type { Account } from '@/types/common';

const createStore = ({ activity = {}, externalActivity = {} } = {}) => {
  return new Vuex.Store({
    getters: {
      assets: () => MOCK_ASSETS,
      account: () => MOCK_ACCOUNT as Account,
      activity: () => activity as AccountHistory<HistoryItem>,
      externalActivity: () => externalActivity as AccountHistory<HistoryItem>,
      externalActivityTotal: () => 4,
      shouldBalanceBeHidden: () => true as boolean,
    },
    actions: {
      getAssets: jest.fn(),
      getAccountActivity: jest.fn(),
      getExternalActivity: jest.fn(),
      resetExternalActivity: jest.fn(),
      clearSyncedAccountActivity: jest.fn(),
      navigate: jest.fn(),
    },
  });
};

useDescribe('WalletHistory.vue', WalletHistory, () => {
  it('should be rendered correctly', () => {
    const wrapper = useShallowMount(WalletHistory, {
      store: createStore({
        activity: MOCK_ACCOUNT_ACTIVITY,
        externalActivity: MOCK_EXTERNAL_ACTIVITY,
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
        activity: MOCK_ACCOUNT_ACTIVITY,
        externalActivity: MOCK_EXTERNAL_ACTIVITY,
      }),
      propsData: { asset: MOCK_ACCOUNT_ASSETS[0] },
    });

    expect(wrapper.vm.$props.asset).toEqual(MOCK_ACCOUNT_ASSETS[0]);
  });

  it('should render spinner when transaction is pending', () => {
    const pendingItem = {
      ...(Object.values(MOCK_ACCOUNT_ACTIVITY)[0] as HistoryItem),
      status: TransactionStatus.InBlock,
    };

    const wrapper = useMount(WalletHistory, {
      store: createStore({
        activity: {
          ...MOCK_ACCOUNT_ACTIVITY,
          [pendingItem.id as string]: pendingItem,
        },
        externalActivity: MOCK_EXTERNAL_ACTIVITY,
      }),
      propsData: { asset: MOCK_ACCOUNT_ASSETS[0] },
    });
    const pendingIcon = wrapper.find('.info-status--loading');

    expect(pendingIcon.exists()).toBeTrue();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('should render error icon when transaction is failed', () => {
    const errorItem = {
      ...(Object.values(MOCK_ACCOUNT_ACTIVITY)[0] as HistoryItem),
      status: TransactionStatus.Error,
    };

    const wrapper = useMount(WalletHistory, {
      store: createStore({
        activity: {
          ...MOCK_ACCOUNT_ACTIVITY,
          [errorItem.id as string]: errorItem,
        },
        externalActivity: MOCK_EXTERNAL_ACTIVITY,
      }),
      propsData: { asset: MOCK_ACCOUNT_ASSETS[0] },
    });
    const errorIcon = wrapper.find('.info-status--error');

    expect(errorIcon.exists()).toBeTrue();
    expect(wrapper.element).toMatchSnapshot();
  });
});
