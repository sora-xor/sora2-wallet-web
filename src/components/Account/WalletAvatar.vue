<template>
  <Identicon :size="size" :theme="theme" :value="address" />
</template>

<script lang="ts">
import Identicon from '@polkadot/vue-identicon';
import { Vue, Component, Prop } from 'vue-property-decorator';

enum THEMES {
  POLKADOT = 'polkadot',
  SUBSTRATE = 'substrate',
  BEACHBALL = 'beachball',
}

@Component({
  components: {
    Identicon,
  },
})
export default class WalletAvatar extends Vue {
  @Prop({ default: 32, type: Number }) readonly size!: number;
  @Prop({ default: THEMES.POLKADOT, type: String }) readonly theme!: string;
  @Prop({ default: '', type: String, required: true }) readonly address!: string;
}
</script>
