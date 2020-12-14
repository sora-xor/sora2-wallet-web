<template>
  <div v-if="!!history.length" class="history s-flex">
    <div
      class="history-item s-flex"
      v-for="(item, index) in history"
      :key="`history-${index}`"
      @click="handleOpenTransactionDetails(item.id)"
    >
      <div class="s-flex">
        <div class="info s-flex">
          <div class="info-operation">{{ item.operation }}</div>
          <div class="info-text">
            {{ `${item.fromAmount} ${item.fromSymbol} for ${item.toAmount} ${item.toSymbol}` }}
          </div>
          <!-- This link was hidden due to PSS-205 task. We'll return it back later.  -->
          <!-- <s-button
            class="info-text-explorer"
            type="link"
            size="small"
            @click="handleOpenBlockExplorer(item)"
          >
            <s-icon name="external-link" size="16px" />
          </s-button> -->
        </div>
        <div class="date">{{ formatDate(item.date) }}</div>
      </div>
      <s-icon :class="getStatusClass(item.status)" :name="getStatusIcon(item.status)" size="20px" />
    </div>
  </div>
  <div v-else class="history-empty">{{ t('history.empty') }}</div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Action } from 'vuex-class'

import TranslationMixin from './mixins/TranslationMixin'
import { formatDate, getStatusIcon, getStatusClass } from '../util'
import { RouteNames } from '../consts'

@Component
export default class WalletHistory extends Mixins(TranslationMixin) {
  @Action navigate

  @Prop() readonly history!: Array<any>

  getStatusIcon = getStatusIcon
  getStatusClass = getStatusClass
  formatDate = formatDate

  handleOpenBlockExplorer (item: any): void {
    // TODO: Add event handling
    this.$emit('block-explorer', item)
  }

  handleOpenTransactionDetails (id: number): void {
    this.navigate({ name: RouteNames.WalletTransactionDetails, params: { id } })
  }
}
</script>

<style scoped lang="scss">
.history {
  flex-direction: column;
  &-item {
    align-items: center;
    padding: 0 $basic-spacing_mini / 2;
    > :first-child {
      flex-direction: column;
      flex: 1;
    }
    &:hover {
      cursor: pointer;
    }
    .info {
      align-items: center;
      &-operation {
        color: var(--s-color-base-content-secondary);
        background-color: var(--s-color-base-background);
        border-radius: var(--s-border-radius-mini);
        font-size: $font-size_mini;
        font-weight: bold;
        padding: $basic-spacing_mini / 2;
        margin-right: $basic-spacing_mini;
      }
      &-text {
        font-size: $font-size_small;
        line-height: $line-height_big;
      }
      &-explorer {
        margin-left: $basic-spacing_mini;
        padding: 0;
      }
      &-status {
        &--success {
          color: var(--s-color-status-success);
        }
        &--error {
          color: var(--s-color-status-error);
        }
      }
    }
    .date {
      @include hint-text;
    }
  }
  &-empty {
    text-align: center;
    @include hint-text;
  }
}
</style>
