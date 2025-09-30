<template>
  <s-notifications-provider>
    <NotificationBridge />
    <slot />
  </s-notifications-provider>
</template>

<script lang="ts" setup>
import { SNotificationsProvider } from '@soramitsu-ui/ui';

import NotificationBridge from './NotificationBridge';
</script>
