<template>
  <div class="content">
    <s-icon class="content__warning-icon" name="notifications-alert-triangle-24" size="64px" />
    <h2 class="content__header">{{ t('confirmNextTxFailure.header') }}</h2>
    <div class="content__info">{{ t('confirmNextTxFailure.info', { fee }) }}</div>
    <div class="content__payoff">{{ t('confirmNextTxFailure.payoff', { sora: TranslationConsts.Sora }) }}</div>
    <s-button type="primary" class="content__button s-typography-button--large" @click="handleConfirm">
      {{ t('confirmNextTxFailure.button') }}
    </s-button>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import TranslationMixin from '../components/mixins/TranslationMixin';

@Component
export default class NetworkFeeWarning extends Mixins(TranslationMixin) {
  @Prop({ type: String }) readonly fee!: string;

  async handleConfirm(): Promise<void> {
    this.$emit('confirm');
  }
}
</script>

<style lang="scss">
$inner-padding: 20px;

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
}
</style>
