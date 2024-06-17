import { defineActions } from 'direct-vuex';

import { RouteNames } from '../../consts';
import { rootActionContext } from '../../store';

import { routerActionContext } from './../router';

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

    const accountRoute = RouteNames.Wallet;
    const connectionRoute = RouteNames.WalletConnection;
    const isConnectionRoute = currentRoute === connectionRoute;

    if (isLoggedIn && isConnectionRoute) {
      commit.navigate({ name: accountRoute });
    } else if (!isLoggedIn && currentRoute !== connectionRoute) {
      commit.navigate({ name: connectionRoute });
    }
  },
});

export default actions;
