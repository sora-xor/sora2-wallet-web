import { Component, Vue } from 'vue-property-decorator';
import { Getter, Action } from 'vuex-class';

import type { ReferrerRewards } from '../../services/types';

@Component
export default class ReferralRewardsMixin extends Vue {
  @Getter referralRewards!: Nullable<ReferrerRewards>;

  @Action getAccountReferralRewards!: AsyncVoidFn;
}
