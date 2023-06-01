<template>
  <component :is="component" v-bind="$attrs" v-on="$listeners" />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { state } from '../store/decorators';

import DesktopConnection from './Connection/Views/DesktopConnection.vue';
import WebConnection from './Connection/Views/WebConnection.vue';

@Component({
  components: { WebConnection, DesktopConnection },
})
export default class WalletConnection extends Vue {
  @state.account.isDesktop isDesktop!: boolean;

  get component(): string {
    return this.isDesktop ? 'DesktopConnection' : 'WebConnection';
  }
}
</script>
