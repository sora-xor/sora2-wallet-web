import { Status, __setNotificationsMock } from '@soramitsu-ui/ui';
import { mount } from '@vue/test-utils';

import NotificationAlertToast from '@/components/NotificationAlertToast.vue';
import NotificationBridge from '@/components/NotificationBridge';
import notificationService from '@/services/notification';

const showMock = vi.fn();

const resetService = () => {
  const unregisterToast = notificationService.registerToastHandler(() => {});
  unregisterToast();
  const unregisterAlert = notificationService.registerAlertHandler(() => {});
  unregisterAlert();
};

describe('NotificationBridge', () => {
  beforeEach(() => {
    showMock.mockReset();
    __setNotificationsMock({ show: showMock });
    resetService();
  });

  afterEach(() => {
    resetService();
  });

  it('forwards toast notifications to Soramitsu notifications provider', () => {
    const close = vi.fn();
    showMock.mockReturnValue({ close });

    const wrapper = mount(NotificationBridge);

    notificationService.notify({
      message: 'Toast body',
      title: 'Toast title',
      severity: 'success',
      timeout: 1200,
      showCloseBtn: false,
    });

    expect(showMock).toHaveBeenCalledTimes(1);
    expect(showMock).toHaveBeenCalledWith({
      title: 'Toast title',
      description: 'Toast body',
      status: Status.Success,
      timeout: 1200,
      showCloseBtn: false,
    });

    wrapper.unmount();
  });

  it('renders alert toast content and wires confirm/cancel callbacks', () => {
    const close = vi.fn();
    showMock.mockImplementation(() => ({ close }));

    const wrapper = mount(NotificationBridge);

    const onConfirm = vi.fn();

    notificationService.alert({
      message: 'Alert body',
      title: 'Alert title',
      severity: 'warning',
      confirmText: 'Retry',
      cancelText: 'Cancel',
      onConfirm,
    });

    expect(showMock).toHaveBeenCalledTimes(1);
    const payload = showMock.mock.calls[0][0];

    expect(payload.title).toBe('Alert title');
    expect(payload.status).toBe(Status.Warning);
    expect(payload.showCloseBtn).toBe(true);
    expect(payload.timeout).toBeUndefined();

    const vnode = payload.descriptionSlot?.();

    expect(vnode).toBeTruthy();
    expect(vnode?.type).toBe(NotificationAlertToast);

    const props = vnode?.props as Record<string, any>;

    expect(props.message).toBe('Alert body');
    expect(props.confirmText).toBe('Retry');
    expect(props.cancelText).toBe('Cancel');

    props.onConfirm();
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);

    props.onCancel();
    expect(close).toHaveBeenCalledTimes(2);

    wrapper.unmount();
  });
});
