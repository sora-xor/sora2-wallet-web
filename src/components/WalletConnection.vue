<template>
  <extension-connection v-if="isDesktop" />
  <desktop-connection v-else />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';

import DesktopConnection from './Connection/DesktopConnection.vue';
import ExtensionConnection from './Connection/ExtensionConnection.vue';

@Component({
  components: { ExtensionConnection, DesktopConnection },
})
export default class WalletConnection extends Vue {
  @State isDesktop!: boolean;
}
</script>
