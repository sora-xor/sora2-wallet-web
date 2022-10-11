<template>
  <div class="s-input-container">
    <s-input :placeholder="t(translation)" :value="formattedAddress" readonly tabindex="-1" />
    <s-button
      class="s-button--copy"
      icon="basic-copy-24"
      :tooltip="copyTooltip(t(translation))"
      type="action"
      alternative
      @click="handleCopyAddress(formattedValue, $event)"
    />
    <s-dropdown
      class="s-dropdown-menu"
      borderRadius="mini"
      type="ellipsis"
      icon="basic-more-vertical-24"
      placement="bottom-end"
      @select="isEthHash ? handleOpenEtherscan() : undefined"
    >
      <template slot="menu">
        <s-dropdown-item v-if="isEthHash" class="s-dropdown-menu__item">
          <span>{{ t('bridgeTransaction.viewInEtherscan') }}</span>
        </s-dropdown-item>
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
              {{ t(`transaction.viewIn.${link.type}`) }}
            </s-dropdown-item>
          </a>
        </template>
      </template>
    </s-dropdown>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import { formatAddress, getExplorerLinks, formatSoraAddress } from '../util';
import TranslationMixin from './mixins/TranslationMixin';
import CopyAddressMixin from './mixins/CopyAddressMixin';
import { ExplorerLink, SoraNetwork, HashType, ExplorerType } from '../consts';
import { state } from '../store/decorators';

@Component
export default class TransactionHashView extends Mixins(TranslationMixin, CopyAddressMixin) {
  @Prop({ type: String, required: true }) readonly value!: string;
  @Prop({ type: String, required: true }) readonly type!: HashType;
  @Prop({ type: String, required: true }) readonly translation!: string;
  @Prop({ type: String, default: '' }) readonly hash!: string;

  @state.settings.soraNetwork private soraNetwork!: SoraNetwork;

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
    if ([HashType.Account, HashType.Block].includes(this.type)) {
      return baseLinks.map(({ type, value }) => ({ type, value: `${value}/${this.type}/${this.formattedValue}` }));
    }
    return baseLinks.map(({ type, value }) => {
      const link = { type } as ExplorerLink;
      if (type === ExplorerType.Sorascan) {
        link.value = `${value}/transaction/${this.value}`;
      } else {
        link.value = `${value}/extrinsic/${this.value}`;
      }
      return link;
    });
  }

  get formattedAddress(): string {
    return formatAddress(this.displayValue, 24);
  }

  handleOpenEtherscan(): void {
    const path = this.type === HashType.EthAccount ? 'address' : 'tx';
    const base = this.soraNetwork !== SoraNetwork.Prod ? 'sepolia' + '.' : '';
    const url = `https://${base}etherscan.io/${path}/${this.value}`;
    const win = window.open(url, '_blank');
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
    right: calc(#{$dropdown-right} + #{$dropdown-width} + #{$basic-spacing-mini});
    z-index: 1;
    &,
    &:hover,
    &:focus,
    &:active {
      background-color: transparent;
      border-color: transparent;
    }
  }
}

.transaction-link {
  color: inherit;
  text-decoration: none;
}
</style>
