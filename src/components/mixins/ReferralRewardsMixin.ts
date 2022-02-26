import { Component, Vue } from 'vue-property-decorator';
import { Getter, Action } from 'vuex-class';

import type { ReferrerRewards } from '../../services/subquery/types';

@Component
export default class ReferralRewardsMixin extends Vue {
  @Getter referralRewards!: ReferrerRewards;

  @Action getAccountReferralRewards!: AsyncVoidFn;
}
