<template>
  <div>
    <div class="login__title">{{ title }}</div>
    <div class="login__step-count">Step {{ stepNumber }}/3</div>
    <template v-if="step === LoginStep.SeedPhrase">
      <div class="seed-grid">
        <div v-for="(word, idx) in sortedSeedPhrase" :key="word">
          <span class="seed-grid__order-number">{{ idx + 1 }}</span>
          <span>{{ word }}</span>
        </div>
      </div>
      <s-button class="login__copy-seed">
        <span>Copy phrase</span>
        <s-icon name="basic-copy-24" size="18"></s-icon>
      </s-button>
      <div class="login__text-advice">
        <p>This is a secret seed of your account. Make sure</p>
        <p>to store it on a non-digital carrier, for example - paper</p>
      </div>
      <s-button class="s-typography-button--large login-btn" type="primary">Next Step</s-button>
    </template>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator';

import TranslationMixin from '../../../components/mixins/TranslationMixin';
import { LoginStep } from '../../../consts';

@Component
export default class CreateAccount extends Mixins(TranslationMixin) {
  @Prop({ type: String }) readonly step!: LoginStep;

  readonly LoginStep = LoginStep;

  get stepNumber(): number {
    return 1;
  }

  get title(): string {
    return 'Seed phrase';
  }

  get seedPhrase(): Array<string> {
    return [
      'TIGER',
      'IDLE',
      'DUTCH',
      'HUNGRY',
      'MERRY',
      'EARLY',
      'MOON',
      'SMOOTH',
      'PARROT',
      'COOL',
      'CLIENT',
      'TOILET',
    ];
  }

  get sortedSeedPhrase(): Array<string> {
    return this.seedPhrase;
  }
}
</script>

<style lang="scss">
.seed-grid {
  margin-top: 18px;

  &__order-number {
    margin-right: 8px;
    color: var(--s-color-base-content-secondary);
  }
}
.login {
  &__text-advice {
    text-align: center;
    font-weight: 300;
  }

  &__copy-seed {
    margin: 20px 0 28px 0 !important;
    height: 28px !important;
    font-size: 12px !important;

    .s-icon-basic-copy-24 {
      margin-left: 6px;
    }
  }
}
</style>
