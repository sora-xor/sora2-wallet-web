<template>
  <div v-if="!!history.length" class="history s-flex">
    <div
      class="history-item s-flex"
      v-for="(item, index) in history"
      :key="`history-${index}`"
    >
      <div class="info s-flex">
        <div class="info-operation">{{ item.operation }}</div>
        <div class="info-text">
          <span>{{ `${item.fromAmount} ${item.fromSymbol} for ${item.toAmount} ${item.toSymbol}` }}</span>
          <s-button
            class="info-text_explorer"
            type="link"
            size="small"
            @click="handleOpenBlockExplorer(item)"
          >
            <s-icon name="external-link" size="16px" />
          </s-button>
        </div>
        <s-icon :class="getStatusClass(item.status)" :name="getStatusIcon(item.status)" size="20px" />
      </div>
      <div class="date">{{ formatDate(item.date) }}</div>
    </div>
  </div>
  <div v-else class="history-empty">{{ t('history.empty') }}</div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'

import TranslationMixin from './mixins/TranslationMixin'
import { formatDate } from '../util'

@Component
export default class WalletHistory extends Mixins(TranslationMixin) {
  @Prop() readonly history!: Array<any>

  handleOpenBlockExplorer (item: any): void {
    this.$emit('block-explorer', item)
  }

  formatDate (value: number): string {
    return formatDate(value)
  }

  getStatusIcon (status: string): string {
    switch (status) {
      case 'IN_PROGRESS': return 'refresh'
      case 'ERROR': return 'circle-x'
      case 'SUCCESS': return 'check-mark'
    }
    return ''
  }

  getStatusClass (status: string): string {
    let state = ''
    switch (status) {
      case 'IN_PROGRESS':
        state = 'loading'
        break
      case 'ERROR':
        state = 'error'
        break
      case 'SUCCESS':
        state = 'success'
        break
    }
    return state ? `info-status info-status--${state}` : 'info-status'
  }
}
</script>

<style scoped lang="scss">
@import '../styles/soramitsu-variables';
@import '../styles/typography';
@import '../styles/layout';

.history {
  flex-direction: column;
  &-item {
    flex-direction: column;
    .info {
      align-items: center;
      &-operation {
        color: $s-color-base-content-secondary;
        background-color: $s-color-base-background;
        border-radius: $border-radius;
        font-size: $font-size_mini;
        font-weight: bold;
        padding: $basic-spacing_mini / 2;
        margin-right: $basic-spacing_mini;
      }
      &-text {
        flex: 1;
        font-size: $font-size_small;
        > span {
          line-height: 3.4;
        }
        &_explorer {
          margin-left: $basic-spacing_mini;
          padding: 0;
        }
      }
      &-status {
        &--success {
          color: $s-color-status-success;
        }
        &--error {
          color: $s-color-status-error;
        }
      }
    }
    .date {
      font-size: $font-size_small;
      color: $s-color-base-content-tertiary;
    }
  }
  &-empty {
    text-align: center;
    font-size: $font-size_small;
    color: $s-color-base-content-tertiary;
  }
}
</style>
