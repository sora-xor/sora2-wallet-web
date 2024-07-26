import { SoraWalletInfo } from '../../consts/wallets';
import { addWalletLocally, checkWallet } from '../../util/account';

import { SoraWallet } from './wallet';

import type { WithKeyring } from '@sora-substrate/util';

export const addSoraWalletLocally = (api: WithKeyring): string => {
  const name = SoraWalletInfo.extensionName;

  try {
    checkWallet(name as any);
  } catch {
    const wallet = new SoraWallet(api);

    addWalletLocally(wallet, SoraWalletInfo, name);
  }

  return name;
};
