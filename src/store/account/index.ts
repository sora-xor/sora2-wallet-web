import { defineModule, localActionContext, localGetterContext } from 'direct-vuex';

import mutations from './mutations';
import state from './state';
import actions from './actions';
import getters from './getters';

import { prepareWalletActionContext } from '../../store';
import { WalletModule } from '../wallet';

const account = defineModule({
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
});

const accountGetterContext = (args: [any, any, any, any]) => localGetterContext(args, account);

const accountActionContextBroken = (context: any) => localActionContext(context, account);
const accountActionContext = ((context: any) =>
  prepareWalletActionContext(context, WalletModule.Account)) as typeof accountActionContextBroken;

export { accountGetterContext, accountActionContext };
export default account;
