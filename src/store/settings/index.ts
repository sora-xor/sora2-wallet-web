import { defineModule, localGetterContext, localActionContext } from 'direct-vuex';

import { prepareWalletActionContext } from '../../store';
import { WalletModule } from '../wallet';

import actions from './actions';
import getters from './getters';
import mutations from './mutations';
import state from './state';

const settings = defineModule({
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
});

const settingsGetterContext = (args: [any, any, any, any]) => localGetterContext(args, settings);
const settingsActionContextBroken = (context: any) => localActionContext(context, settings);
const settingsActionContext = ((context: any) =>
  prepareWalletActionContext(context, WalletModule.Settings)) as typeof settingsActionContextBroken;

export { settingsActionContext, settingsGetterContext };
export default settings;
