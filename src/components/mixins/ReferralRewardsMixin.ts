import { Component, Vue } from 'vue-property-decorator';
import { Getter, Action } from 'vuex-class';

@Component
export default class ReferralRewardsMixin extends Vue {
  @Getter referralRewards!: any;

  @Action getAccountReferralRewards!: () => Promise<void>;

  getReferralRewards(): void {
    this.getAccountReferralRewards();
  }
}
