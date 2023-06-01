import { defineModule, localActionContext } from 'direct-vuex';

import { prepareWalletActionContext } from '../../store';
import { WalletModule } from '../wallet';

import actions from './actions';
import mutations from './mutations';
import state from './state';

const subscriptions = defineModule({
  namespaced: true,
  state,
  mutations,
  actions,
});

const subscriptionsActionContextBroken = (context: any) => localActionContext(context, subscriptions);

const subscriptionsActionContext = ((context: any) =>
  prepareWalletActionContext(context, WalletModule.Subscriptions)) as typeof subscriptionsActionContextBroken;

export { subscriptionsActionContext };
export default subscriptions;
