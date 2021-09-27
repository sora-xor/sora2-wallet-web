<template>
  <wallet-history />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import WalletHistory from './WalletHistory.vue';

@Component({
  components: { WalletHistory },
})
export default class WalletActivity extends Vue {}
</script>
