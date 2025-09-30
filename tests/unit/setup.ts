import { TextEncoder, TextDecoder } from 'node:util';

import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, vi } from 'vitest';
import { defineComponent, h } from 'vue';

type NotificationsMock = {
  show: ReturnType<typeof vi.fn>;
};

declare module '@soramitsu-ui/ui' {
  export function __setNotificationsMock(mock: NotificationsMock): void;
  export function __resetNotificationsMock(): void;
}

const createNotificationsMock = (): NotificationsMock => ({
  show: vi.fn(() => ({ close: vi.fn() })),
});

let notificationsMock: NotificationsMock = createNotificationsMock();

vi.mock('@soramitsu-ui/ui', async () => {
  const actual = await vi.importActual<typeof import('@soramitsu-ui/ui')>('@soramitsu-ui/ui');

  return {
    ...actual,
    useNotifications: () => notificationsMock,
    __setNotificationsMock: (mock: NotificationsMock) => {
      notificationsMock = mock;
    },
    __resetNotificationsMock: () => {
      notificationsMock = createNotificationsMock();
    },
  };
});

vi.mock('@soramitsu-ui/ui/styles', () => ({}));

vi.mock('@polkadot/vue-identicon', () => {
  const IdenticonStub = defineComponent({
    name: 'PolkadotIdenticon',
    props: {
      address: { type: String, default: '' },
      theme: { type: String, default: 'polkadot' },
      size: { type: [String, Number], default: 32 },
      isAlternative: { type: Boolean, default: false },
    },
    setup(props) {
      const dimension = typeof props.size === 'number' ? `${props.size}px` : props.size;
      return () =>
        h('div', {
          class: 'polkadot-identicon-stub',
          'data-address': props.address,
          'data-theme': props.theme,
          'data-alternative': String(props.isAlternative),
          style: { width: dimension, height: dimension },
        });
    },
  });

  return {
    __esModule: true,
    default: IdenticonStub,
  };
});

beforeEach(() => {
  notificationsMock = createNotificationsMock();
  setActivePinia(createPinia());
});

if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder as unknown as typeof globalThis.TextEncoder;
}

if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder as unknown as typeof globalThis.TextDecoder;
}

const constantDate = new Date(2020, 10, 27, 23, 59, 59);

class FixedDate extends Date {
  constructor(...args: ConstructorParameters<typeof Date>) {
    if (args.length) {
      super(...args);
      return;
    }

    super(constantDate.getTime());
    return constantDate;
  }

  static now(): number {
    return constantDate.getTime();
  }
}

(globalThis as any).Date = FixedDate;

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
