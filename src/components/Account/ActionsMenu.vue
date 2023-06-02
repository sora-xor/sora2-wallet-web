<template>
  <s-dropdown
    type="ellipsis"
    border-radius="mini"
    icon="basic-more-vertical-24"
    class="account-actions"
    v-on="$listeners"
  >
    <template slot="menu">
      <s-dropdown-item
        v-for="{ value, name, icon, status } in items"
        :key="value"
        :value="value"
        :icon="icon"
        :class="['account-actions__item', status]"
      >
        {{ name }}
      </s-dropdown-item>
    </template>
  </s-dropdown>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import { AccountActionTypes } from '../../consts';
import LoadingMixin from '../mixins/LoadingMixin';
import NotificationMixin from '../mixins/NotificationMixin';

const ActionsData = {
  [AccountActionTypes.Rename]: {
    name: 'account.rename',
    icon: 'basic-options-24',
    status: '',
  },
  [AccountActionTypes.Export]: {
    name: 'account.export',
    icon: 'basic-pulse-24',
    status: '',
  },
  [AccountActionTypes.Logout]: {
    name: 'logoutText',
    icon: 'security-logout-24',
    status: '',
  },
  [AccountActionTypes.Delete]: {
    name: 'account.delete',
    icon: 'paperclip-16',
    status: 'error',
  },
};

@Component
export default class AccountActionsMenu extends Mixins(NotificationMixin, LoadingMixin) {
  @Prop({ default: () => [], type: Array }) readonly actions!: AccountActionTypes[];

  get items() {
    return this.actions.map((value) => {
      const { name, icon, status } = ActionsData[value];

      return {
        value,
        name: this.t(name),
        icon,
        status,
      };
    });
  }
}
</script>

<style lang="scss">
.account-actions {
  &.el-dropdown {
    color: inherit;
    line-height: 0;
  }

  &__item.el-dropdown-menu__item {
    & > i {
      color: var(--s-color-base-content-tertiary);
    }

    &.error {
      &,
      &:hover,
      &:focus,
      &:active {
        color: var(--s-color-status-error);
        & > i {
          color: inherit;
        }
      }
    }
  }
}
</style>
