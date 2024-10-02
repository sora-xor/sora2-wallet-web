import { SoraWalletInfo } from '../../consts/wallets';
import { addWalletLocally, checkWallet } from '../../util/account';

import { SoraWallet } from './wallet';

import type { WithKeyring } from '@sora-substrate/sdk';

export const addSoraWalletLocally = (api: WithKeyring, dAppName: string): string => {
  const name = SoraWalletInfo.extensionName;

  try {
    checkWallet(name as any);
  } catch {
    const wallet = new SoraWallet(api);

    addWalletLocally(wallet, SoraWalletInfo, dAppName);
  }

  return name;
};
