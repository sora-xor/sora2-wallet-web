import Wallet from '@/components/Wallet.vue';
import { WalletTabs } from '@/consts';

import { useDescribe, useShallowMount, useVuex } from '../../utils';
import { MOCK_ACCOUNT, MOCK_HISTORY, MOCK_WALLET_PERMISSIONS } from '../../utils/mock';

import type { WalletPermissions } from '../../../src/consts';

const createStore = (
  currentTab: WalletTabs,
  permissions: WalletPermissions = MOCK_WALLET_PERMISSIONS,
  isExternal = true
) =>
  useVuex({
    settings: {
      state: () => ({
        permissions,
      }),
    },
    router: {
      state: () => ({
        currentRouteParams: { currentTab },
      }),
    },
    account: {
      state: () => ({
        permissions,
        isExternal,
      }),
      getters: {
        account: () => MOCK_ACCOUNT,
      },
      actions: {
        logout: jest.fn(),
      },
    },
    transactions: {
      state: () => ({
        history: MOCK_HISTORY,
      }),
      getters: {
        selectedTx: () => null,
      },
    },
  });

useDescribe('Wallet.vue', Wallet, () => {
  Object.values(WalletTabs).map((item) =>
    it(`[WalletTabs.${item}]: should be rendered correctly`, () => {
      const wrapper = useShallowMount(Wallet, { store: createStore(item) });
      expect(wrapper.element).toMatchSnapshot();
    })
  );

  it('should not render action button when createAssets property is false', () => {
    const wrapper = useShallowMount(Wallet, {
      store: createStore(WalletTabs.Assets, {
        ...MOCK_WALLET_PERMISSIONS,
        createAssets: false,
      }),
    });

    const actionBtn = wrapper.find('.base-title_action');

    expect(actionBtn.exists()).toBeFalse();
  });
});
