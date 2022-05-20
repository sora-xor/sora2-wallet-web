import { useDescribe, useShallowMount, useVuex } from '../../utils';
import { Extensions } from '../../../src/consts';
import WalletConnection from '@/components/WalletConnection.vue';
import WalletBase from '@/components/WalletBase.vue';
import ExtensionTag from '@/components/ExtensionTag.vue';
import { POLKADOT_JS_ACCOUNTS_MOCK, SUBWALLET_JS_ACCOUNTS_MOCK } from '../../utils/WalletConnectionMock';

const createStore = ({
  currentRouteParams = { isAccountSwitch: false },
  polkadotJsAccounts = POLKADOT_JS_ACCOUNTS_MOCK,
  availableExtensions = [Extensions.PolkadotJS],
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
        availableExtensions,
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
        ExtensionTag,
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('[Extension available]: Accounts should be rendered', async () => {
    const wrapper = useShallowMount(WalletConnection, {
      store: createStore(),
      stubs: {
        WalletBase,
        ExtensionTag,
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

  it('[Multiple Extensions available]: Accounts should be rendered', async () => {
    const wrapper = useShallowMount(WalletConnection, {
      store: createStore({
        availableExtensions: Object.values(Extensions),
        polkadotJsAccounts: [...POLKADOT_JS_ACCOUNTS_MOCK, ...SUBWALLET_JS_ACCOUNTS_MOCK],
      }),
      stubs: {
        WalletBase,
        ExtensionTag,
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
        ExtensionTag,
      },
    });

    wrapper.setData({ step: 2 });

    await wrapper.vm.$nextTick();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('[Extensions is not available]: Install extension screen should be rendered', () => {
    const wrapper = useShallowMount(WalletConnection, {
      store: createStore({ availableExtensions: [] }),
      stubs: {
        WalletBase,
        ExtensionTag,
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
