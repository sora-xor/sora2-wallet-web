import { defineModule, localActionContext } from 'direct-vuex';

import state from './state';
import mutations from './mutations';
import actions from './actions';

import { prepareWalletActionContext } from '../../store';

const subscriptions = defineModule({
  namespaced: true,
  state,
  mutations,
  actions,
});

const subscriptionsActionContextBroken = (context: any) => localActionContext(context, subscriptions);

const subscriptionsActionContext = ((context: any) =>
  prepareWalletActionContext(context, 'subscriptions')) as typeof subscriptionsActionContextBroken;

export { subscriptionsActionContext };
export default subscriptions;
