import { defineModule, localActionContext } from 'direct-vuex';

import mutations from './mutations';
import state from './state';
import actions from './actions';

import { prepareWalletActionContext } from '../../store';
import { WalletModule } from '../wallet';

const router = defineModule({
  namespaced: true,
  state,
  mutations,
  actions,
});

const routerActionContextBroken = (context: any) => localActionContext(context, router);
const routerActionContext = ((context: any) =>
  prepareWalletActionContext(context, WalletModule.Router)) as typeof routerActionContextBroken;

export { routerActionContext };
export default router;
