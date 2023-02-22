<template>
  <wallet-base title="Connect via Google"> </wallet-base>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator';

import LoadingMixin from '../../mixins/LoadingMixin';
import NotificationMixin from '../../mixins/NotificationMixin';

import WalletBase from '../../WalletBase.vue';

@Component({
  components: {
    WalletBase,
  },
})
export default class GoogleConnection extends Mixins(NotificationMixin, LoadingMixin) {}
</script>
