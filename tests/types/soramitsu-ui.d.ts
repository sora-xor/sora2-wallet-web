declare module '@soramitsu-ui/ui' {
  import type { App, Component } from 'vue';

  export const Status: {
    Success: string;
    Warning: string;
    Error: string;
    Info: string;
  };

  export type NotificationMock = {
    show: (...args: any[]) => any;
  };

  export const SButton: Component;
  export const SNotificationsProvider: Component;

  export function plugin(): { install(app: App): void };
  export function useNotifications(): NotificationMock;
  export function __setNotificationsMock(mock: NotificationMock): void;
}

declare module '@soramitsu-ui/ui/styles';
