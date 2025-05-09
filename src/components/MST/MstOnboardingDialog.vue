<template>
  <dialog-base :title="t('mst.about')" :visible.sync="isVisible" append-to-body>
    <div class="mst-info">
      <div class="about">
        <s-card v-for="(section, index) in displayedSectionsAbout" :key="index" class="section">
          <div>
            <img :src="section.image" :alt="section.alt" />
            <p>{{ section.text }}</p>
          </div>
        </s-card>
      </div>
      <s-card class="wallet-card">
        <div class="img-text">
          <img :src="sectionsAbout[2].image" :alt="sectionsAbout[2].alt" />
          <div>
            <p>{{ sectionsAbout[2].text }}</p>
            <!-- <a href="https://www.google.com" target="_blank" rel="noopener noreferrer" class="learn-more">
              Learn more
            </a> -->
          </div>
        </div>
      </s-card>

      <h1>{{ t('mst.how') }}</h1>
      <div class="how-to">
        <s-card v-for="(section, index) in sectionHowTo" :key="index" class="section">
          <div>
            <img :src="section.image" :alt="section.alt" />
            <p>{{ section.text }}</p>
            <!-- <a
              v-if="index === sectionHowTo.length - 1"
              href="https://www.google.com"
              target="_blank"
              rel="noopener noreferrer"
              class="learn-more"
            >
              Learn more
            </a> -->
          </div>
        </s-card>
      </div>
      <s-button type="primary" @click="connectFearlessOrCreateMST">
        {{ isMSTAvailable ? t('mst.createMst') : t('mst.connectFearless') }}
      </s-button>
    </div>
    <create-mst-wallet-dialog :visible.sync="showCreateMSTWalletDialog" @closeMstCreate="handleCloseDialog" />
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

import CreateMstWalletDialog from './CreateMstWalletDialog.vue';

import type { Route } from '../../store/router/types';
@Component({
  components: {
    DialogBase,
    SimpleNotification,
    FormattedAddress,
    CreateMstWalletDialog,
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

  showCreateMSTWalletDialog = false;

  sectionsAbout = [
    {
      image: MSTKeys,
      alt: 'mst keys',
      text: this.t('mst.mstKeys'),
    },
    {
      image: MSTSign,
      alt: 'mst sign',
      text: this.t('mst.mstSign'),
    },
    {
      image: MSTWallet,
      alt: 'mst wallet',
      text: this.t('mst.mstWallet'),
    },
  ];

  sectionHowTo = [
    {
      image: MSTFearless,
      alt: 'fearless wallet logo',
      text: this.t('mst.mstFearless'),
    },
    {
      image: MSTIcon,
      alt: 'mst icon',
      text: this.t('mst.mstIcon'),
    },
  ];

  get displayedSectionsAbout() {
    return this.sectionsAbout.slice(0, 2);
  }

  handleCloseDialog() {
    this.closeDialog();
  }

  public connectFearlessOrCreateMST() {
    if (this.isMSTAvailable) {
      this.showCreateMSTWalletDialog = true;
    } else {
      this.closeDialog();
      this.navigate({ name: RouteNames.WalletConnection });
    }
  }
}
</script>

<style lang="scss" scoped>
.mst-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  .s-card {
    padding: 8px 0 !important;
  }

  h1 {
    margin-right: auto;
    font-size: 24px;
    margin-top: 24px;
    color: var(--s-color-base-content-primary);
  }
  .about,
  .how-to {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    div {
      display: flex;
      flex-direction: row;
    }
  }
  .about,
  .wallet-card {
    img {
      width: 72px;
      height: 72px;
    }
  }
  .about {
    gap: 12px;
    margin-bottom: 12px;
  }
  .how-to {
    gap: 12px;
    margin-top: 12px;
    margin-bottom: 24px;
    width: 100%;
    img {
      margin-right: 12px;
      width: 40px;
      height: 40px;
    }
    .section {
      width: 100%;
    }
    .s-card {
      padding: 17px 12px !important;
    }
  }
  .section {
    display: flex;
    flex-direction: row;
    align-items: center;
    text-align: center;
    background-color: var(--s-color-base-border-primary);
    p {
      max-width: 178px;
      text-align: left;
      margin-left: 4px;
    }
  }
  .el-button {
    width: 100%;
    font-size: 24px;
  }
  .wallet-card {
    display: flex;
    align-items: center;

    img {
      margin-right: 12px;
    }
    .img-text {
      display: flex;
      flex-direction: row;
    }

    div {
      display: flex;
      flex-direction: column;
      align-items: flex-start;

      p {
        margin-top: 4px;
        color: var(--s-color-base-content-primary);
      }

      .learn-more {
        color: var(--s-color-theme-accent);
        text-decoration: underline;
      }
    }
  }
}
</style>
