import { Component, Vue } from 'vue-property-decorator';

import { state, action } from '../../store/decorators';

import type { ReferrerRewards } from '../../services/indexer/subsquid/types';

@Component
export default class ReferralRewardsMixin extends Vue {
  @state.account.referralRewards referralRewards!: ReferrerRewards;
  @action.account.getAccountReferralRewards getAccountReferralRewards!: AsyncFnWithoutArgs;
}
