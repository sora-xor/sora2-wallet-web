<template>
  <component :is="component" v-bind="$attrs" v-on="$listeners" />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import DesktopConnection from './Connection/Views/DesktopConnection.vue';
import ExtensionConnection from './Connection/Views/ExtensionConnection.vue';

import { state } from '../store/decorators';

@Component({
  components: { ExtensionConnection, DesktopConnection },
})
export default class WalletConnection extends Vue {
  @state.account.isDesktop isDesktop!: boolean;

  get component(): string {
    return this.isDesktop ? 'DesktopConnection' : 'ExtensionConnection';
  }
}
</script>
