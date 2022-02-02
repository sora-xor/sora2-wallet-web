<template>
  <wallet-base>
    <div class="desktop-connection" v-loading="loading">
      <welcome-page />
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator';

import LoadingMixin from '../mixins/LoadingMixin';
import TranslationMixin from '../mixins/TranslationMixin';
import WalletBase from '../WalletBase.vue';
import WelcomePage from './Desktop/WelcomePage.vue';

@Component({
  components: { WalletBase, WelcomePage },
})
export default class DesktopConnection extends Mixins(TranslationMixin, LoadingMixin) {}
</script>

<style scoped lang="scss">
.desktop-connection {
  background-color: chartreuse;
}
</style>
