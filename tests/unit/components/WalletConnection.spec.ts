import Vuex from 'vuex';

import { useDescribe, useShallowMount } from '../../utils';
import WalletConnection from '@/components/WalletConnection.vue';
import WalletBase from '@/components/WalletBase.vue';
import { POLKADOT_JS_ACCOUNTS_MOCK } from '../../utils/WalletConnectionMock';

const createStore = ({
  currentRouteParams = { isAccountSwitch: false },
  polkadotJsAccounts = POLKADOT_JS_ACCOUNTS_MOCK,
  extensionAvailability = true,
} = {}) => {
  return new Vuex.Store({
    getters: {
      currentRouteParams: () => currentRouteParams,
      polkadotJsAccounts: () => polkadotJsAccounts,
      extensionAvailability: () => extensionAvailability,
      isWalletLoaded: () => true,
    },
    actions: {
      importPolkadotJs: jest.fn(),
    },
  });
};

useDescribe('WalletConnection.vue', WalletConnection, () => {
  it('[Extension available]: Connect account screen should be rendered', () => {
    const wrapper = useShallowMount(WalletConnection, {
      store: createStore(),
      stubs: {
        WalletBase,
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('[Extension available]: Accounts should be rendered', async () => {
    const wrapper = useShallowMount(WalletConnection, {
      store: createStore(),
      stubs: {
        WalletBase,
      },
    });

    wrapper.setData({ step: 2 });

    // const handler = jest.spyOn(wrapper.vm, 'handleActionClick' as any);
    // const actionButton = wrapper.find('.action-btn');

    // actionButton.vm.$emit('click');

    await wrapper.vm.$nextTick();

    // expect(handler).toHaveBeenCalled();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('[Extension available]: No accounts, refresh screen should be rendered', async () => {
    const wrapper = useShallowMount(WalletConnection, {
      store: createStore({ polkadotJsAccounts: [] }),
      stubs: {
        WalletBase,
      },
    });

    wrapper.setData({ step: 2 });

    await wrapper.vm.$nextTick();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('[Extension is not available]: Install extension screen should be rendered', () => {
    const wrapper = useShallowMount(WalletConnection, {
      store: createStore({ extensionAvailability: false }),
      stubs: {
        WalletBase,
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
