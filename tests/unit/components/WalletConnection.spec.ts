import AccountCard from '@/components/Account/AccountCard.vue';
import WalletBase from '@/components/WalletBase.vue';
import WalletConnection from '@/components/WalletConnection.vue';

import { useDescribe, useShallowMount, useVuex } from '../../utils';
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
      data: () => ({
        step: 2,
      }),
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('[Extension available]: Accounts should be rendered', async () => {
    const wrapper = useShallowMount(WalletConnection, {
      store: createStore(),
      stubs: {
        WalletBase,
      },
      data: () => ({
        step: 3,
      }),
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('[Extension available]: No accounts, refresh screen should be rendered', async () => {
    const wrapper = useShallowMount(WalletConnection, {
      store: createStore({ polkadotJsAccounts: [] }),
      stubs: {
        WalletBase,
      },
      data: () => ({
        step: 3,
      }),
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
