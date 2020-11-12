<template>
  <wallet-history :history="activity" />
</template>

<script lang="ts">
import { Component, Mixins, Vue } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'

import WalletHistory from './WalletHistory.vue'

@Component({
  components: { WalletHistory }
})
export default class WalletActivity extends Vue {
  @Getter activity!: Array<any>
  @Action getAccountActivity

  mounted (): void {
    this.getAccountActivity()
  }
}
</script>
