import { BackupAccountType } from '../types';

import { encryptToHex, decryptFromHex } from './crypto';

import type { DecryptedBackupAccount, EncryptedBackupAccount } from '../types';

export class BackupAccountCrypto {
  private static decrypt = decryptFromHex;
  private static encrypt = encryptToHex;

  public static encryptAccount(
    decryptedBackupAccount: DecryptedBackupAccount,
    password: string
  ): EncryptedBackupAccount {
    const encryptedSubstrateDerivationPath = decryptedBackupAccount.substrateDerivationPath
      ? this.encrypt(decryptedBackupAccount.substrateDerivationPath, password)
      : null;

    const encryptedEthDerivationPath = decryptedBackupAccount.ethDerivationPath
      ? this.encrypt(decryptedBackupAccount.ethDerivationPath, password)
      : null;

    const encryptedMnemonicPhrase = decryptedBackupAccount.mnemonicPhrase
      ? this.encrypt(decryptedBackupAccount.mnemonicPhrase, password)
      : null;

    const encryptedEthSeed = decryptedBackupAccount.seed?.ethSeed
      ? this.encrypt(decryptedBackupAccount.seed.ethSeed, password)
      : undefined;

    const encryptedSubstrateSeed = decryptedBackupAccount.seed?.substrateSeed
      ? this.encrypt(decryptedBackupAccount.seed.substrateSeed, password)
      : undefined;

    const encryptedSeed =
      encryptedEthSeed || encryptedSubstrateSeed
        ? { ethSeed: encryptedEthSeed, substrateSeed: encryptedSubstrateSeed }
        : null;

    return {
      name: decryptedBackupAccount.name,
      address: decryptedBackupAccount.address,
      encryptedMnemonicPhrase,
      encryptedEthDerivationPath,
      encryptedSubstrateDerivationPath,
      cryptoType: String(decryptedBackupAccount.cryptoType),
      json: decryptedBackupAccount.json,
      encryptedSeed,
      backupAccountType: decryptedBackupAccount.backupAccountType,
    };
  }

  public static decryptAccount(
    encryptedBackupAccount: EncryptedBackupAccount,
    password: string
  ): DecryptedBackupAccount {
    const types = encryptedBackupAccount.backupAccountType.map((type) => type.toUpperCase()) as BackupAccountType[];

    let seed: DecryptedBackupAccount['seed'] = null;

    if (types.includes(BackupAccountType.SEED)) {
      if (!encryptedBackupAccount.encryptedSeed) {
        throw new Error(`${BackupAccountType.SEED} is selected but encryptedSeed is null`);
      }

      if (!encryptedBackupAccount.encryptedSeed.substrateSeed && !encryptedBackupAccount.encryptedSeed.ethSeed) {
        throw new Error(`${BackupAccountType.SEED} is selected but encryptedSeed and substrateSeed are null`);
      }

      const substrateSeed = encryptedBackupAccount.encryptedSeed.substrateSeed
        ? this.decrypt(encryptedBackupAccount.encryptedSeed.substrateSeed, password)
        : undefined;

      const ethSeed = encryptedBackupAccount.encryptedSeed.ethSeed
        ? this.decrypt(encryptedBackupAccount.encryptedSeed.ethSeed, password)
        : undefined;

      seed = { substrateSeed, ethSeed };
    }

    let passphrase: DecryptedBackupAccount['mnemonicPhrase'] = null;

    if (types.includes(BackupAccountType.PASSHRASE)) {
      if (!encryptedBackupAccount.encryptedMnemonicPhrase) {
        throw new Error(`${BackupAccountType.PASSHRASE} is selected but encryptedMnemonicPhrase is null`);
      }

      passphrase = this.decrypt(encryptedBackupAccount.encryptedMnemonicPhrase, password);
    }

    if (types.includes(BackupAccountType.JSON)) {
      if (!encryptedBackupAccount.json) {
        throw new Error(`${BackupAccountType.JSON} is selected but json is null`);
      }
    }

    const ethDerivationPath = encryptedBackupAccount.encryptedEthDerivationPath
      ? this.decrypt(encryptedBackupAccount.encryptedEthDerivationPath, password)
      : null;

    const substrateDerivationPath = encryptedBackupAccount.encryptedSubstrateDerivationPath
      ? this.decrypt(encryptedBackupAccount.encryptedSubstrateDerivationPath, password)
      : null;

    return {
      name: encryptedBackupAccount.name,
      address: encryptedBackupAccount.address,
      mnemonicPhrase: passphrase,
      substrateDerivationPath,
      ethDerivationPath,
      cryptoType: encryptedBackupAccount.cryptoType,
      json: encryptedBackupAccount.json,
      seed,
      backupAccountType: types,
    };
  }
}
