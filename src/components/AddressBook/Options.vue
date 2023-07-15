<template>
  <el-popover popper-class="address-book-popover book-popover" trigger="click" :visible-arrow="false">
    <div class="address-book__option" @click="handleSelectAddress(record.address, record.name)">
      <s-icon name="finance-send-24" size="16" />
      <span>{{ t('addressBook.options.send') }}</span>
    </div>
    <div :class="computedClass" @click="handleEditRecord(record.address)">
      <s-icon name="el-icon-edit" />
      <span>{{ t('addressBook.options.edit') }}</span>
    </div>
    <div :class="computedClass" @click="handleDeleteRecord(record.address)">
      <s-icon name="el-icon-delete" />
      <span>{{ t('addressBook.options.delete') }}</span>
    </div>
    <div slot="reference" @click="handleOpenOptions">
      <s-icon class="address-book__option-icon" name="basic-more-vertical-24" />
    </div>
  </el-popover>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import TranslationMixin from '../mixins/TranslationMixin';

import type { AccountBook } from '../../types/common';

@Component
export default class Options extends Mixins(TranslationMixin) {
  @Prop({ default: { name: '', address: '' }, type: Object }) readonly record!: AccountBook;
  @Prop({ default: true, type: Boolean }) readonly withActiveOptions!: boolean;

  get computedClass(): string {
    return this.withActiveOptions ? 'address-book__option' : 'address-book__option--not-active';
  }

  handleSelectAddress(address: string, name: string): void {
    this.$emit('select-address', address, name);
  }

  handleOpenOptions(event: Event): void {
    event.stopPropagation();
    this.$root.$emit('closePopover');
  }

  handleEditRecord(address: string): void {
    if (!this.withActiveOptions) return;
    this.$emit('edit', address);
  }

  handleDeleteRecord(address: string): void {
    if (!this.withActiveOptions) return;
    this.$emit('delete', address);
  }
}
</script>

<style lang="scss" scoped>
.address-book {
  &__option {
    font-size: var(--s-font-size-medium);
    font-weight: 300;
    line-height: 200%;
    letter-spacing: -0.02em;

    span {
      margin-left: $inner-spacing-mini;
      font-size: var(--s-font-size-medium);
    }

    &:hover {
      cursor: pointer;
    }

    &:hover i {
      cursor: pointer;
      color: var(--s-color-base-content-primary);
    }

    i {
      color: var(--s-color-base-content-secondary);
    }

    &--not-active {
      color: var(--s-color-base-content-tertiary);

      span {
        margin-left: $inner-spacing-mini;
        font-size: var(--s-font-size-medium);
        font-weight: 300;
        line-height: 200%;
        letter-spacing: -0.02em;
      }
    }

    &--not-active:hover {
      cursor: not-allowed;
    }

    &-icon {
      color: var(--s-color-base-content-tertiary);
      &:hover {
        cursor: pointer;
        color: var(--s-color-base-content-secondary);
      }
    }
  }
}
</style>
