import type { PolkadotJsAccount } from '../../src/types/common';
import { Extensions } from '../../src/consts';

export const POLKADOT_JS_ACCOUNTS_MOCK: Array<PolkadotJsAccount> = [
  { address: '5GBrh18cWZA6anJDPP7mX4WhYQFMZc8wMxP62RNaMPTfEJ1E', name: 'nikita', source: Extensions.PolkadotJS },
  { address: '5GeFeYXRoTNbX5nTwUCz5q1rbhJckgJvD9L9dRZc55RW3qZq', name: 'nikita2', source: Extensions.PolkadotJS },
  { address: '5ENeJuY8sQHZqvhEhwRGPuc7RTR8HrjFUZC3nEYNTS7jg4AB', name: 'Nikita3', source: Extensions.PolkadotJS },
  { address: '5Fo3FLDvmZUYQhjZvhNu1Ejsa86ksSQaxZ1CqJVCqgoNgvyM', name: 'name', source: Extensions.PolkadotJS },
];

export const SUBWALLET_JS_ACCOUNTS_MOCK: Array<PolkadotJsAccount> = [
  { address: '5Fo3FLDvmZUYQhjZvhNu1Ejsa86ksSQaxZ1CqJVCqgoNgvyM', name: 'name', source: Extensions.SubwalletJS },
];

export const POLKADOT_WALLET_MOCK = {
  title: 'Polkadot{.js}',
  extensionName: Extensions.PolkadotJS,
  installed: true,
  logo: {
    src: '/img/polkadot.svg',
    alt: 'polkadot',
  },
  installUrl: 'https://polkadot.org',
};

export const SUBWALLET_WALLET_MOCK = {
  title: 'SubWallet',
  extensionName: Extensions.SubwalletJS,
  installed: false,
  logo: {
    src: '/img/subwallet.svg',
    alt: 'subwallet',
  },
  installUrl: 'https://subwallet.org',
};
