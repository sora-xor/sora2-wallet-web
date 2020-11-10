<template>
  <div v-if="activity.length > 0" class="activity s-flex">
    <div
      class="activity-item s-flex"
      v-for="(item, index) in activity"
      :key="`activity-${index}`"
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
        <s-icon :class="getStatusClass(item.status)" :name="getStatusName(item.status)" size="20px" />
      </div>
      <div class="date">{{ formatDate(item.date) }}</div>
    </div>
  </div>
  <div v-else class="activity-empty">{{ t('activity.empty') }}</div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'

import TranslationMixin from './mixins/TranslationMixin'
import { RouteNames } from '../consts'
import { formatDate } from '../util'

@Component
export default class WalletActivity extends Mixins(TranslationMixin) {
  @Getter activity!: Array<any>
  @Action getAccountActivity

  mounted (): void {
    this.getAccountActivity()
  }

  handleOpenBlockExplorer (item: any): void {
    this.$emit('block-explorer', item)
  }

  formatDate (value: number): string {
    return formatDate(value)
  }

  getStatusName (status: string): string {
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

.activity {
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
        padding: 4px;
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
