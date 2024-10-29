<template>
  <dialog-base title="About" :visible.sync="isVisible" append-to-body :style="{ maxWidth: '650px' }">
    <div class="mst-info">
      <div class="about">
        <div v-for="(section, index) in sectionsAbout" :key="index" class="section">
          <img :src="section.image" :alt="section.alt" />
          <p>{{ section.text }}</p>
          <a
            v-if="index === sectionsAbout.length - 1"
            href="https://www.google.com"
            target="_blank"
            rel="noopener noreferrer"
            class="learn-more"
          >
            Learn more
          </a>
        </div>
      </div>
      <div class="how-to">
        <div v-for="(section, index) in sectionHowTo" :key="index" class="section">
          <img :src="section.image" :alt="section.alt" />
          <p>{{ section.text }}</p>
          <a
            v-if="index === sectionsAbout.length - 1"
            href="https://www.google.com"
            target="_blank"
            rel="noopener noreferrer"
            class="learn-more"
          >
            Learn more
          </a>
        </div>
      </div>
      <s-button type="primary" @click="connectFearlessOrCreateMST">
        {{ isMSTAvailable ? 'create multisig wallet' : 'connect via fearless' }}
      </s-button>
    </div>
  </dialog-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import { RouteNames } from '@/consts';

import MSTFearless from '../../assets/img/MSTFearless.svg';
import MSTIcon from '../../assets/img/MSTIcon.svg';
import MSTKeys from '../../assets/img/MSTKeys.svg';
import MSTSign from '../../assets/img/MSTSign.svg';
import MSTWallet from '../../assets/img/MSTWallet.svg';
import { state, mutation } from '../../store/decorators';
import DialogBase from '../DialogBase.vue';
import DialogMixin from '../mixins/DialogMixin';
import NotificationMixin from '../mixins/NotificationMixin';
import TranslationMixin from '../mixins/TranslationMixin';
import FormattedAddress from '../shared/FormattedAddress.vue';
import SimpleNotification from '../SimpleNotification.vue';

import type { Route } from '../../store/router/types';

@Component({
  components: {
    DialogBase,
    SimpleNotification,
    FormattedAddress,
  },
})
export default class MstOnboardingDialog extends Mixins(TranslationMixin, NotificationMixin, DialogMixin) {
  @state.settings.isMSTAvailable isMSTAvailable!: boolean;

  @mutation.router.navigate private navigate!: (options: Route) => void;

  readonly MSTIcon = MSTIcon;
  readonly MSTKeys = MSTKeys;
  readonly MSTSign = MSTSign;
  readonly MSTWallet = MSTWallet;
  readonly MSTFearless = MSTFearless;

  sectionsAbout = [
    {
      image: MSTKeys,
      alt: 'mst keys',
      text: 'Multisig wallets require multiple signatures and keys.',
    },
    {
      image: MSTSign,
      alt: 'mst sign',
      text: 'A set number of participants must sign the transaction to complete it.',
    },
    {
      image: MSTWallet,
      alt: 'mst wallet',
      text: 'Multiple signatures reduce the risk of key compromise.',
    },
  ];

  sectionHowTo = [
    {
      image: MSTFearless,
      alt: 'fearless wallet logo',
      text: 'Install Fearless wallet extension or log in',
    },
    {
      image: MSTIcon,
      alt: 'mst icon',
      text: 'Create a Multisig account.',
    },
  ];

  public connectFearlessOrCreateMST() {
    if (this.isMSTAvailable) {
      this.navigate({ name: RouteNames.CreateMSTWallet });
    } else {
      this.navigate({ name: RouteNames.WalletConnection });
    }
  }
}
</script>

<style lang="scss">
.dialog-wrapper .el-dialog {
  max-width: 650px !important;
}
</style>

<style lang="scss" scoped>
.mst-info {
  display: flex;
  flex-direction: column;
  align-items: center;

  .about,
  .how-to {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  .how-to {
    margin-top: 24px;
    margin-bottom: 31px;
  }
  .section {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    p {
      max-width: 178px;
      margin-top: auto;
    }
    a {
      color: var(--s-color-theme-accent);
    }
  }
  .el-button {
    width: 100%;
    font-size: 24px;
  }
}
</style>
