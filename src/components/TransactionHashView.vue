<template>
  <div class="s-input-container">
    <s-input :placeholder="t(translation)" :value="formattedAddress" readonly tabindex="-1" />
    <s-button
      class="s-button--copy"
      :class="{ 'with-dropdown': hasExplorerLinks }"
      icon="basic-copy-24"
      :tooltip="copyTooltip(t(translation))"
      type="action"
      alternative
      @click="handleCopyAddress(formattedValue, $event)"
    />
    <s-dropdown
      v-if="hasExplorerLinks"
      class="s-dropdown-menu"
      borderRadius="mini"
      type="ellipsis"
      icon="basic-more-vertical-24"
      placement="bottom-end"
      @select="isEthHash ? handleOpenEtherscan() : undefined"
    >
      <template slot="menu">
        <a v-if="isEthHash" class="transaction-link" :href="etherscanLink" target="_blank" rel="nofollow noopener">
          <s-dropdown-item class="s-dropdown-menu__item">
            {{ t('transaction.viewIn', { explorer: TranslationConsts.Etherscan }) }}
          </s-dropdown-item>
        </a>
        <template v-else>
          <a
            v-for="link in explorerLinks"
            :key="link.type"
            class="transaction-link"
            :href="link.value"
            target="_blank"
            rel="nofollow noopener"
          >
            <s-dropdown-item class="s-dropdown-menu__item">
              {{ t('transaction.viewIn', { explorer: getExplorerTranslation(link.type) }) }}
            </s-dropdown-item>
          </a>
        </template>
      </template>
    </s-dropdown>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import TranslationMixin from './mixins/TranslationMixin';
import CopyAddressMixin from './mixins/CopyAddressMixin';
import { formatAddress, getExplorerLinks, formatSoraAddress } from '../util';
import { state } from '../store/decorators';
import { HashType, ExplorerType, SoraNetwork } from '../consts';
import type { ExplorerLink } from '../consts';

@Component
export default class TransactionHashView extends Mixins(TranslationMixin, CopyAddressMixin) {
  @Prop({ type: String, required: true }) readonly value!: string;
  @Prop({ type: String, required: true }) readonly type!: HashType;
  @Prop({ type: String, required: true }) readonly translation!: string;
  @Prop({ type: String, default: '' }) readonly hash!: string;
  /** Should be set for SORA ID type for Polkadot explorer */
  @Prop({ type: String, default: '' }) readonly block!: string;

  @state.settings.soraNetwork private soraNetwork!: SoraNetwork;

  get hasExplorerLinks(): boolean {
    return this.isEthHash || !!this.explorerLinks.length;
  }

  get isEthHash(): boolean {
    return [HashType.EthAccount, HashType.EthTransaction].includes(this.type);
  }

  get formattedValue(): string {
    if (this.type === HashType.Account) {
      return formatSoraAddress(this.value);
    }
    return this.value;
  }

  get displayValue(): string {
    return this.hash || this.formattedValue;
  }

  get explorerLinks(): Array<ExplorerLink> {
    if (this.isEthHash) return [];

    const baseLinks = getExplorerLinks(this.soraNetwork);
    if (!baseLinks.length) return [];

    switch (this.type) {
      case HashType.Account:
        return baseLinks
          .filter(({ type }) => type !== ExplorerType.Polkadot) // Cuz accounts cannot be parsed using Polkadot
          .map(({ type, value }) => ({ type, value: `${value}/${this.type}/${this.formattedValue}` }));
      case HashType.Block:
        return baseLinks.map(({ type, value }) => {
          const link = { type } as ExplorerLink;
          if (type === ExplorerType.Polkadot) {
            link.value = `${value}/${this.formattedValue}`;
          } else {
            link.value = `${value}/${this.type}/${this.formattedValue}`;
          }
          return link;
        });
      case HashType.ID:
        return baseLinks
          .map(({ type, value }) => {
            const link = { type } as ExplorerLink;
            if (type === ExplorerType.Sorascan) {
              link.value = `${value}/transaction/${this.value}`;
            } else if (type === ExplorerType.Subscan) {
              link.value = `${value}/extrinsic/${this.value}`;
            } else if (this.block) {
              // ExplorerType.Polkadot
              link.value = `${value}/${this.block}`;
            }
            return link;
          })
          .filter((value) => !!value.value); // Polkadot explorer won't be shown without block prop
      default:
        return [];
    }
  }

  get formattedAddress(): string {
    return formatAddress(this.displayValue, 24);
  }

  get etherscanLink(): string {
    const path = this.type === HashType.EthAccount ? 'address' : 'tx';
    const base = this.soraNetwork !== SoraNetwork.Prod ? 'sepolia' + '.' : '';
    return `https://${base}etherscan.io/${path}/${this.value}`;
  }

  getExplorerTranslation(type: ExplorerType): string {
    switch (type) {
      case ExplorerType.Polkadot:
        return this.TranslationConsts.Polkadot;
      case ExplorerType.Sorascan:
        return this.TranslationConsts.SORAScan;
      case ExplorerType.Subscan:
        return this.TranslationConsts.Subscan;
    }
  }

  handleOpenEtherscan(): void {
    const win = window.open(this.etherscanLink, '_blank');
    win && win.focus();
  }
}
</script>

<style lang="scss">
.s-dropdown-menu {
  // TODO: fix UI library
  &__item {
    border-radius: calc(var(--s-border-radius-mini) / 2);
  }
}
</style>

<style scoped lang="scss">
$dropdown-right: 15px;
$dropdown-width: var(--s-size-mini);

.s-input-container {
  position: relative;
  + .s-input-container {
    margin-top: var(--s-basic-spacing);
  }
  .s-dropdown-menu {
    position: absolute;
    z-index: 1;
    top: 0;
    right: $dropdown-right;
    bottom: 0;
    margin-top: auto;
    margin-bottom: auto;
    width: $dropdown-width;
    height: var(--s-size-mini);
    line-height: 1;
  }
  .s-button--copy {
    position: absolute;
    top: 0;
    bottom: 0;
    margin-top: auto;
    margin-bottom: auto;
    right: $dropdown-right;
    z-index: 1;
    &,
    &:hover,
    &:focus,
    &:active {
      background-color: transparent;
      border-color: transparent;
    }
    &.with-dropdown {
      right: calc(#{$dropdown-right} + #{$dropdown-width} + #{$basic-spacing-mini});
    }
  }
}

.transaction-link {
  color: inherit;
  text-decoration: none;
}
</style>
