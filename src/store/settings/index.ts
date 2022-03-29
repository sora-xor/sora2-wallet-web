import { defineModule, localActionContext } from 'direct-vuex';

import mutations from './mutations';
import state from './state';
import actions from './actions';

import { prepareWalletActionContext } from '../../store';

const settings = defineModule({
  namespaced: true,
  state,
  mutations,
  actions,
});

const settingsActionContextBroken = (context: any) => localActionContext(context, settings);
const settingsActionContext = ((context: any) =>
  prepareWalletActionContext(context, 'settings')) as typeof settingsActionContextBroken;

export { settingsActionContext };
export default settings;
