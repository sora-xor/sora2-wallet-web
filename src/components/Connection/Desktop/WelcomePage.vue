<template>
  <div class="welcome-page">
    <div class="pswap-logo"></div>
    <h3 class="welcome-page__header">{{ t('desktop.welcome.header') }}</h3>
    <h3 class="welcome-page__advice">{{ t('desktop.welcome.advice') }}</h3>
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
import TranslationMixin from '../../mixins/TranslationMixin';

@Component
export default class WelcomePage extends Mixins(TranslationMixin) {
  createAccount(): void {
    this.$emit('create');
  }

  importAccount(): void {
    this.$emit('import');
  }
}
</script>

<style lang="scss" scoped>
.welcome-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .pswap-logo {
    background: url('~@/assets/img/pswap.svg') no-repeat;
    height: 60px;
    width: 60px;
    margin-bottom: 18px;
  }

  &__advice {
    margin-bottom: 16px;
  }

  &__text {
    font-weight: 300;
    text-align: center;
    margin-bottom: 16px;
  }
}
</style>
