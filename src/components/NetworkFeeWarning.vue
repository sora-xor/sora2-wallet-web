<template>
  <div class="content">
    <s-icon class="content__warning-icon" name="notifications-alert-triangle-24" size="64px" />
    <h2 class="content__header">{{ t('confirmNextTxFailure.header') }}</h2>
    <div class="content__info">{{ t('confirmNextTxFailure.info', { fee }) }}</div>
    <div class="content__payoff">{{ t('confirmNextTxFailure.payoff') }}</div>
    <div class="content__line"></div>
    <div class="content__switch">
      <s-switch v-model="hidePopup" />
      <span>{{ t('doNotShowText') }}</span>
    </div>
    <s-button type="primary" class="content__button s-typography-button--large" @click="handleConfirm">
      {{ t('confirmNextTxFailure.button') }}
    </s-button>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import { mutation } from '../store/decorators';
import TranslationMixin from './mixins/TranslationMixin';

@Component
export default class NetworkFeeWarning extends Mixins(TranslationMixin) {
  @Prop({ type: String }) readonly fee!: string;

  @mutation.settings.setAllowFeePopup private setAllowFeePopup!: (flag: boolean) => void;

  hidePopup = false;

  async handleConfirm(): Promise<void> {
    this.setAllowFeePopup(!this.hidePopup);
    this.$emit('confirm');
  }
}
</script>

<style lang="scss">
$inner-padding: 20px;
// TODO: Set scoped. Remove important
.content {
  font-family: var(--s-font-family-default) !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-top: calc(var(--s-size-big) * -1);

  &__warning-icon {
    color: var(--s-color-status-error) !important;
    margin-top: calc(var(--s-size-mini) / 3);
    margin-bottom: $inner-padding;
  }

  &__header,
  &__info,
  &__payoff {
    margin-bottom: $inner-padding;
    font-weight: 300;
  }

  &__button {
    width: 100%;
  }

  &__line {
    width: 100%;
    height: 1px;
    background-color: var(--s-color-base-border-secondary);
  }

  &__switch {
    @include switch-block;
    padding: 0 #{$basic-spacing-small};
    margin: calc(var(--s-size-small) / 2) 0 calc(var(--s-size-small) / 2);
  }
}
</style>
