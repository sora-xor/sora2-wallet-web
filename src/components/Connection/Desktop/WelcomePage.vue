<template>
  <div class="login welcome-page__block">
    <div v-if="loggedIn" class="welcome-page__block">
      <token-logo class="pswap-desktop-logo" tokenSymbol="PSWAP" />
      <h3 class="welcome-page__header">{{ t('desktop.welcome.header') }}</h3>
      <h3 class="welcome-page__headline">{{ t('desktop.welcome.headline') }}</h3>
    </div>
    <div class="welcome-page__text">{{ t('desktop.welcome.text') }}</div>
    <s-button @click="createAccount" class="s-typography-button--large login-btn" type="primary">{{
      t('desktop.welcome.createAccount')
    }}</s-button>
    <s-button @click="importAccount" class="s-typography-button--large login-btn">{{
      t('desktop.welcome.importAccount')
    }}</s-button>
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator';

import TokenLogo from '../../TokenLogo.vue';

import { PolkadotJsAccount } from '../../../types/common';
import TranslationMixin from '../../mixins/TranslationMixin';
import { state } from '../../../store/decorators';

@Component({
  components: {
    TokenLogo,
  },
})
export default class WelcomePage extends Mixins(TranslationMixin) {
  @state.account.polkadotJsAccounts private polkadotJsAccounts!: Array<PolkadotJsAccount>;

  get loggedIn(): boolean {
    return this.polkadotJsAccounts.length === 0;
  }

  createAccount(): void {
    this.$emit('create');
  }

  importAccount(): void {
    this.$emit('import');
  }
}
</script>

<style lang="scss" scoped>
@include login-view;

.welcome-page {
  &__block {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  &__headline {
    margin-bottom: calc(var(--s-size-small) / 2);
  }

  &__text {
    font-weight: 300;
    text-align: center;
    margin-bottom: calc(var(--s-size-small) / 2);
  }
}
</style>

<style lang="scss">
.pswap-desktop-logo {
  margin-top: -36px;
  margin-bottom: 28px;
  .asset-logo {
    height: 64px;
    width: 64px;
  }
}
</style>
