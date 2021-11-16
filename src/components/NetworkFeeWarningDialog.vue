<template>
  <dialog-base :visible.sync="isVisible" :showCloseButton="false" customClass="el-dialog__header--hide">
    <div class="content">
      <div class="content__warning-icon"></div>
      <h1 class="content__header">{{ t('confirmNextTxFailure.header') }}</h1>
      <div class="content__info">{{ t('confirmNextTxFailure.info', { fee }) }}</div>
      <div class="content__payoff">{{ t('confirmNextTxFailure.payoff') }}</div>
      <s-button type="primary" class="content__button s-typography-button--large" @click="handleConfirm">
        {{ t('confirmNextTxFailure.button') }}
      </s-button>
    </div>
  </dialog-base>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import DialogBase from './DialogBase.vue';
import DialogMixin from './mixins/DialogMixin';
import TranslationMixin from '@/components/mixins/TranslationMixin';

@Component({
  name: 'NetworkFeeWarningDialog',
  components: {
    DialogBase,
  },
})
export default class NetworkFeeWarningDialog extends Mixins(DialogMixin, TranslationMixin) {
  @Prop({ type: String }) readonly fee!: string;

  async handleConfirm(): Promise<void> {
    this.$emit('confirm', true);
    this.closeDialog();
  }
}
</script>

<style lang="scss">
$inner-padding: 20px;

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  &__warning-icon {
    background-image: url('~@/assets/img/warning-icon.svg');
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    height: 60px;
    width: 66px;
    margin-top: var(--s-size-mini);
    margin-bottom: $inner-padding;
  }

  &__header,
  &__info,
  &__payoff {
    margin-bottom: $inner-padding;
    font-weight: 300;
  }

  &__button {
    margin-bottom: var(--s-size-mini) !important;
    width: 100%;
  }
}
</style>
