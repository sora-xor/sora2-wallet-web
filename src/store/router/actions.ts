import { defineActions } from 'direct-vuex';

import { routerActionContext } from './../router';
import { rootActionContext } from '../../store';
import { RouteNames } from '../../consts';

const actions = defineActions({
  async back(context): Promise<void> {
    const { commit, state } = routerActionContext(context);
    const { rootGetters } = rootActionContext(context);
    const { currentRoute, previousRoute, previousRouteParams } = state;
    const { isLoggedIn } = rootGetters.wallet.account;
    if (!isLoggedIn || !previousRoute || [currentRoute, previousRoute].includes(RouteNames.WalletConnection)) {
      return;
    }
    commit.navigate({ name: previousRoute, params: previousRouteParams });
  },
  async checkCurrentRoute(context): Promise<void> {
    const { commit, state } = routerActionContext(context);
    const { rootGetters } = rootActionContext(context);
    const { currentRoute } = state;
    const { isLoggedIn } = rootGetters.wallet.account;

    console.log('isLoggedIn', isLoggedIn);
    console.log('currentRoute', currentRoute);
    console.log('RouteNames.WalletConnection', RouteNames.WalletConnection);

    if (isLoggedIn && currentRoute === RouteNames.WalletConnection) {
      commit.navigate({ name: RouteNames.Wallet });
    } else if (!isLoggedIn && currentRoute !== RouteNames.WalletConnection) {
      commit.navigate({ name: RouteNames.WalletConnection });
    }
  },
});

export default actions;
