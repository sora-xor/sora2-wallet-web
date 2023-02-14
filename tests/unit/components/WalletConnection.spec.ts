import { useDescribe, useShallowMount, useVuex } from '../../utils';
import WalletConnection from '@/components/WalletConnection.vue';
import WalletBase from '@/components/WalletBase.vue';
import AccountCard from '@/components/Account/AccountCard.vue';
import {
  POLKADOT_JS_ACCOUNTS_MOCK,
  POLKADOT_WALLET_MOCK,
  SUBWALLET_WALLET_MOCK,
} from '../../utils/WalletConnectionMock';

const createStore = ({
  currentRouteParams = { isAccountSwitch: false },
  polkadotJsAccounts = POLKADOT_JS_ACCOUNTS_MOCK,
  availableWallets = [POLKADOT_WALLET_MOCK, SUBWALLET_WALLET_MOCK],
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
        availableWallets,
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

  it('[Extension available]: Extensions should be rendered', async () => {
    const wrapper = useShallowMount(WalletConnection, {
      store: createStore(),
      stubs: {
        WalletBase,
        AccountCard,
      },
    });

    wrapper.setData({ step: 2 });

    await wrapper.vm.$nextTick();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('[Extension available]: Accounts should be rendered', async () => {
    const wrapper = useShallowMount(WalletConnection, {
      store: createStore(),
      stubs: {
        WalletBase,
      },
    });

    wrapper.setData({ step: 3 });

    await wrapper.vm.$nextTick();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('[Extension available]: No accounts, refresh screen should be rendered', async () => {
    const wrapper = useShallowMount(WalletConnection, {
      store: createStore({ polkadotJsAccounts: [] }),
      stubs: {
        WalletBase,
      },
    });

    wrapper.setData({ step: 3 });

    await wrapper.vm.$nextTick();

    expect(wrapper.element).toMatchSnapshot();
  });
});
