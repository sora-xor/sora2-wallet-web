import { defineModule, localActionContext, localGetterContext } from 'direct-vuex';

import { prepareWalletActionContext } from '../../store';
import { WalletModule } from '../wallet';

import actions from './actions';
import getters from './getters';
import mutations from './mutations';
import state from './state';

const transactions = defineModule({
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
});

const transactionsGetterContext = (args: [any, any, any, any]) => localGetterContext(args, transactions);

const transactionsActionContextBroken = (context: any) => localActionContext(context, transactions);
const transactionsActionContext = ((context: any) =>
  prepareWalletActionContext(context, WalletModule.Transactions)) as typeof transactionsActionContextBroken;

export { transactionsGetterContext, transactionsActionContext };
export default transactions;
