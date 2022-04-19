import { defineMutations } from 'direct-vuex';

import type { Route, RouterState } from './types';

const mutations = defineMutations<RouterState>()({
  navigate(state, params: Route): void {
    state.previousRoute = state.currentRoute;
    state.previousRouteParams = { ...state.currentRouteParams };
    state.currentRoute = params.name;
    state.currentRouteParams = params.params || {};
  },
});

export default mutations;
