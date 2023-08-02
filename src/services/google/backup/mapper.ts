import { api } from '../../../api';
import { formatSoraAddress } from '../../../util';
import { BackupAccountType } from '../types';

import { BackupAccountCrypto } from './account';
import { generateSeed } from './crypto';

import type { DecryptedBackupAccount, EncryptedBackupAccount } from '../types';
import type { KeyringPair$Json } from '@polkadot/keyring/types';

export class BackupAccountMapper {
  public static getPairJson(encryptedAccount: EncryptedBackupAccount, password: string): Nullable<KeyringPair$Json> {
    const decryptedAccount = BackupAccountCrypto.decryptAccount(encryptedAccount, password);

    if (decryptedAccount.json?.substrateJson) {
      return JSON.parse(decryptedAccount.json.substrateJson) as KeyringPair$Json;
    }

    const suri = decryptedAccount.mnemonicPhrase || decryptedAccount.seed?.substrateSeed;

    if (suri) {
      const pair = api.createAccountPair(suri, decryptedAccount.name);

      return pair.toJson(password);
    }

    return null;
  }

  public static createFromPairJson(
    pairJson: KeyringPair$Json,
    password: string,
    mnemonicPhrase?: string
  ): EncryptedBackupAccount {
    const decryptedAccount: DecryptedBackupAccount = {
      name: (pairJson.meta?.name as string) || '',
      address: formatSoraAddress(pairJson.address),
      cryptoType: 'sr25519'.toUpperCase(),
      backupAccountType: [BackupAccountType.JSON],
      mnemonicPhrase,
      substrateDerivationPath: null,
      ethDerivationPath: null,
      seed: null,
      json: {
        substrateJson: JSON.stringify(pairJson),
      },
    };

    if (mnemonicPhrase) {
      decryptedAccount.seed = { substrateSeed: generateSeed(mnemonicPhrase) };
      decryptedAccount.backupAccountType.push(BackupAccountType.PASSHRASE, BackupAccountType.SEED);
    }

    const encryptedAccount = BackupAccountCrypto.encryptAccount(decryptedAccount, password);

    return encryptedAccount;
  }

  public static changeName(encryptedAccount: EncryptedBackupAccount, name: string): EncryptedBackupAccount {
    // update name in root
    encryptedAccount.name = name;
    // update name in substrateJson
    if (encryptedAccount.json?.substrateJson) {
      const substrateJson = JSON.parse(encryptedAccount.json.substrateJson);
      substrateJson.meta = substrateJson.meta || {};
      substrateJson.meta.name = name;
      encryptedAccount.json.substrateJson = JSON.stringify(substrateJson);
    }

    return encryptedAccount;
  }
}
