import { defineModule, localActionContext } from 'direct-vuex';

import { prepareWalletActionContext } from '../../store';
import { WalletModule } from '../wallet';

import actions from './actions';
import mutations from './mutations';
import state from './state';

const settings = defineModule({
  namespaced: true,
  state,
  mutations,
  actions,
});

const settingsActionContextBroken = (context: any) => localActionContext(context, settings);
const settingsActionContext = ((context: any) =>
  prepareWalletActionContext(context, WalletModule.Settings)) as typeof settingsActionContextBroken;

export { settingsActionContext };
export default settings;
