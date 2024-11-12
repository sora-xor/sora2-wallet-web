<template>
  <div class="identity">
    <s-tooltip v-if="identityName" border-radius="mini">
      <div class="account-identity">
        <div :class="['account-identity-status', { approved: isApproved }]">
          <s-icon :name="identityIcon" size="12" />
        </div>
        {{ identityName }}
      </div>

      <template #content>
        <table class="identity-data">
          <tr v-for="row in identityData" :key="row.key">
            <td align="right" class="identity-data-key">{{ row.key }}</td>
            <td align="left" class="identity-data-value">{{ row.value }}</td>
          </tr>
        </table>
      </template>
    </s-tooltip>
    <template v-else>
      {{ localName }}
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { AccountIdentity } from '../../types/common';

@Component
export default class Identity extends Vue {
  @Prop({ required: true, type: Object }) readonly identity!: AccountIdentity;
  @Prop({ default: '', type: String }) readonly localName!: string;

  get isApproved(): boolean {
    return !!this.identity.approved;
  }

  get identityName(): string {
    return this.identity.name;
  }

  get identityLegalName(): string {
    return this.identity.legalName;
  }

  get identityIcon(): string {
    return this.isApproved ? 'basic-check-mark-24' : 'notifications-info-24';
  }

  get identityData(): { key: string; value: string }[] {
    return [
      { key: 'display', value: this.identityName },
      { key: 'legal', value: this.identityLegalName },
      { key: 'local', value: this.localName },
    ].filter((item) => !!item.value);
  }
}
</script>

<style scoped lang="scss">
.identity {
  display: inline-flex;
}

.account-identity {
  display: flex;
  align-items: center;
  gap: $basic-spacing-mini;

  &-status {
    display: flex;
    align-items: center;
    justify-content: center;
    width: $basic-spacing-medium;
    height: $basic-spacing-medium;
    border-radius: 50%;
    background-color: var(--s-color-status-info);

    &.approved {
      background-color: var(--s-color-status-success);
    }
  }
}
</style>
