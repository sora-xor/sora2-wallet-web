import { useDescribe, useShallowMount, useVuex } from '../../utils';
import WalletConnection from '@/components/WalletConnection.vue';
import WalletBase from '@/components/WalletBase.vue';
import { POLKADOT_JS_ACCOUNTS_MOCK } from '../../utils/WalletConnectionMock';

const createStore = ({
  currentRouteParams = { isAccountSwitch: false },
  polkadotJsAccounts = POLKADOT_JS_ACCOUNTS_MOCK,
  extensionAvailability = true,
} = {}) =>
  useVuex({
    settings: {
      state: () => ({
        isWalletLoaded: true,
      }),
    },
    account: {
      state: () => ({
        polkadotJsAccounts,
        extensionAvailability,
      }),
      actions: {
        importPolkadotJs: jest.fn(),
      },
    },
    router: {
      state: () => ({
        currentRouteParams,
      }),
    },
  });

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
