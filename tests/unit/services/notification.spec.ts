import { Status } from '@soramitsu-ui/ui';

import notificationService from '@/services/notification';

const resetService = () => {
  const unregisterToast = notificationService.registerToastHandler(() => {});
  unregisterToast();
  const unregisterAlert = notificationService.registerAlertHandler(() => {});
  unregisterAlert();
};

describe('notificationService', () => {
  beforeEach(() => {
    resetService();
  });

  afterEach(() => {
    resetService();
  });

  it('notifies registered toast handlers with normalized payload', () => {
    const handler = vi.fn();
    const unregister = notificationService.registerToastHandler(handler);

    notificationService.notify({
      message: 'Toast message',
      title: 'Toast title',
      severity: 'success',
      timeout: 5000,
      showCloseBtn: false,
    });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({
      message: 'Toast message',
      title: 'Toast title',
      status: Status.Success,
      timeout: 5000,
      showCloseBtn: false,
    });

    unregister();
  });

  it('queues toasts until a handler is registered', () => {
    notificationService.notify({
      message: 'Deferred toast',
      severity: 'warning',
    });

    const handler = vi.fn();
    const unregister = notificationService.registerToastHandler(handler);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({
      message: 'Deferred toast',
      title: undefined,
      status: Status.Warning,
      timeout: undefined,
      showCloseBtn: undefined,
    });

    unregister();
  });

  it('uses fallback severity for alerts and flushes queued alerts', () => {
    notificationService.alert({
      message: 'Deferred alert',
    });

    const handler = vi.fn();
    const unregister = notificationService.registerAlertHandler(handler);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({
      message: 'Deferred alert',
      title: undefined,
      status: Status.Error,
      confirmText: undefined,
      cancelText: undefined,
      onConfirm: undefined,
    });

    unregister();
  });

  it('delivers alert payloads with normalized severity and callbacks', () => {
    const onConfirm = vi.fn();
    const handler = vi.fn();
    const unregister = notificationService.registerAlertHandler(handler);

    notificationService.alert({
      message: 'Immediate alert',
      title: 'Alert title',
      severity: 'info',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      onConfirm,
    });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({
      message: 'Immediate alert',
      title: 'Alert title',
      status: Status.Info,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      onConfirm,
    });

    unregister();
  });

  it('stops delivering toasts after unregistering the handler', () => {
    const handler = vi.fn();
    const unregister = notificationService.registerToastHandler(handler);

    unregister();

    notificationService.notify({
      message: 'After unregister',
    });

    expect(handler).not.toHaveBeenCalled();

    const nextHandler = vi.fn();
    const nextUnregister = notificationService.registerToastHandler(nextHandler);

    expect(nextHandler).toHaveBeenCalledTimes(1);
    expect(nextHandler).toHaveBeenCalledWith({
      message: 'After unregister',
      title: undefined,
      status: Status.Info,
      timeout: undefined,
      showCloseBtn: undefined,
    });

    nextUnregister();
  });
});
