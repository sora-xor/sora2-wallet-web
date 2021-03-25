<template>
  <Identicon
    :size="size"
    :theme="theme"
    :value="address"
  />
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import Identicon from '@polkadot/vue-identicon'

enum THEMES {
  POLKADOT = 'polkadot',
  SUBSTRATE = 'substrate',
  BEACHBALL = 'beachball'
}

@Component({
  components: {
    Identicon
  }
})
export default class WalletAvatar extends Vue {
  @Prop({ default: 32, type: Number }) readonly size!: number
  @Prop({ default: THEMES.POLKADOT, type: String }) readonly theme!: string
  @Prop({ default: '', type: String, required: true }) readonly address!: string
}
</script>
