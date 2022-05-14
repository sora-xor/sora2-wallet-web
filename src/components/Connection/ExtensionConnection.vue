<template>
  <wallet-base :title="t('connection.title')">
    <div class="extension-connection" v-loading="loading">
      <template v-if="!loading">
        <template v-if="step === Step.First">
          <p class="extension-connection-text">{{ t('connection.text') }}</p>
          <p v-if="!extensionAvailability" class="extension-connection-text" v-html="t('connection.install')" />
        </template>
        <template v-else-if="!polkadotJsAccounts.length">
          <p class="wallet-connection-text">
            {{ t('connection.noAccounts') }}
          </p>
        </template>

        <template v-if="step === Step.First || (step === Step.Second && !polkadotJsAccounts.length)">
          <s-button
            class="extension-connection-action s-typography-button--large action-btn"
            type="primary"
            :loading="loading"
            @click="handleActionClick"
          >
            {{ t(actionButtonText) }}
          </s-button>
          <s-button
            class="extension-connection-action s-typography-button--large learn-more-btn"
            type="tertiary"
            icon="question-circle-16"
            icon-position="right"
            @click="handleLearnMoreClick"
          >
            {{ t('connection.action.learnMore') }}
          </s-button>
          <p
            v-if="!extensionAvailability"
            class="extension-connection-text no-permissions"
            v-html="t('connection.noPermissions')"
          />
        </template>
        <div v-else-if="step === Step.Second">
          <connected-account-list @handleSelectAccount="handleSelectAccount" />
        </div>
      </template>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { PolkadotJsAccount } from '../../types/common';
import { Asset } from '@sora-substrate/util/build/assets/types';
import { Mixins, Component } from 'vue-property-decorator';
import LoadingMixin from '../mixins/LoadingMixin';
import TranslationMixin from '../mixins/TranslationMixin';
import WalletBase from '../WalletBase.vue';
import WalletAccount from '../WalletAccount.vue';
import ConnectedAccountList from './common/ConnectedAccountList.vue';
import { state, action, getter } from '@/store/decorators';

enum Step {
  First = 1,
  Second = 2,
}

@Component({
  components: { WalletBase, WalletAccount, ConnectedAccountList },
})
export default class WalletConnection extends Mixins(TranslationMixin, LoadingMixin) {
  readonly Step = Step;

  step = Step.First;

  @state.router.currentRouteParams private currentRouteParams!: Record<string, Nullable<Asset>>;
  @state.account.extensionAvailability extensionAvailability!: boolean;

  @getter.account.polkadotJsAccounts polkadotJsAccounts!: Array<PolkadotJsAccount>;

  @action.account.importPolkadotJs private importPolkadotJs!: (address: string) => Promise<void>;

  get isAccountSwitch(): boolean {
    return !!this.currentRouteParams.isAccountSwitch;
  }

  get actionButtonText(): string {
    if (this.step === Step.First && !this.extensionAvailability) {
      return 'connection.action.install';
    }
    if (this.step === Step.Second && !this.polkadotJsAccounts.length) {
      return 'connection.action.refresh';
    }
    return 'connection.action.connect';
  }

  async mounted(): Promise<void> {
    await this.withApi(async () => {
      if (this.isAccountSwitch) {
        this.navigateToAccountList();
      }
    });
  }

  handleActionClick(): void {
    if (this.step === Step.First && !this.extensionAvailability) {
      window.open('https://polkadot.js.org/extension/', '_blank');
      return;
    }
    if (this.step === Step.Second && !this.polkadotJsAccounts.length) {
      window.history.go();
      return;
    }

    this.navigateToAccountList();
  }

  async handleSelectAccount(account: PolkadotJsAccount): Promise<void> {
    await this.withLoading(async () => {
      try {
        await this.importPolkadotJs(account.address);
      } catch (error) {
        this.$alert(this.t('enterAccountError'), this.t('errorText'));
        this.step = Step.First;
      }
    });
  }

  private navigateToAccountList(): void {
    this.step = Step.Second;
  }

  handleLearnMoreClick(): void {
    this.$emit('learn-more');
  }
}
</script>

<style lang="scss">
.wallet-connection-link {
  color: var(--s-color-theme-accent);
  text-decoration: none;
}
.wallet-connection-accounts {
  @include scrollbar($basic-spacing-big);
}
</style>

<style scoped lang="scss">
.extension-connection {
  // Margin and padding are set for the loader
  margin: calc(var(--s-basic-spacing) * -1);
  min-height: 204px;
  padding: var(--s-basic-spacing);

  & > *:not(:first-child) {
    margin-top: $basic-spacing-medium;
  }

  &-text {
    font-size: var(--s-font-size-extra-small);
    font-weight: 300;
    line-height: var(--s-line-height-base);
    color: var(--s-color-base-content-primary);
  }

  &-action {
    width: 100%;
    & + & {
      margin-left: 0;
    }
  }
}
</style>
