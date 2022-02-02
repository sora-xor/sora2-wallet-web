<template>
  <div>
    <h3>{{ t('desktop.welcome.header') }}</h3>
    <div>{{ t('desktop.welcome.text') }}</div>
  </div>
</template>

<script lang="ts">
import { Mixins } from 'vue-property-decorator';
import TranslationMixin from '../../mixins/TranslationMixin';

export default class WelcomePage extends Mixins(TranslationMixin) {}
</script>
