<template>
  <extension-connection v-if="isDesktop" />
  <desktop-connection v-else />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import DesktopConnection from './Connection/DesktopConnection.vue';
import ExtensionConnection from './Connection/ExtensionConnection.vue';

import { state } from '../store/decorators';

@Component({
  components: { ExtensionConnection, DesktopConnection },
})
export default class WalletConnection extends Vue {
  @state.settings.isDesktop isDesktop!: boolean;
}
</script>
