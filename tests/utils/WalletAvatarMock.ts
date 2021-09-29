enum THEMES {
  POLKADOT = 'polkadot',
  SUBSTRATE = 'substrate',
  BEACHBALL = 'beachball',
}

interface WalletAvatar {
  title: string;
  size?: number;
  theme?: THEMES;
  address: string;
}

const address = 'cnWRzNrVQpnMoq4GNDyUjTp1ZTWxTaXNguoRTTqg45j4g23yq';

export const MOCK_WALLET_AVATAR: Array<WalletAvatar> = [
  {
    title: 'With default Theme (Polkadot) and Size',
    address: address,
  },
  {
    title: 'With Beachball Theme',
    theme: THEMES.BEACHBALL,
    address: address,
  },
  {
    title: 'With Substrate Theme',
    theme: THEMES.SUBSTRATE,
    address: address,
  },
  {
    title: 'With Size 10',
    size: 10,
    address: address,
  },
  {
    title: 'With Empty Address',
    address: '',
  },
];
