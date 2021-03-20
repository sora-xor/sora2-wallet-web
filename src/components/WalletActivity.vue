<template>
  <wallet-history :history="activity" />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import WalletHistory from './WalletHistory.vue'

@Component({
  components: { WalletHistory }
})
export default class WalletActivity extends Vue {
  @Getter activity!: Array<any>

  mounted (): void {
  }
}
</script>
