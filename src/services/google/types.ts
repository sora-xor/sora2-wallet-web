export enum BackupAccountType {
  PASSHRASE = 'PASSHRASE',
  JSON = 'JSON',
  SEED = 'SEED',
}

export type Json = {
  substrateJson?: string;
  ethJson?: string;
};

export type Seed = {
  substrateSeed?: string;
  ethSeed?: string;
};

export type EncryptedBackupAccount = {
  name: string;
  address: string;
  encryptedMnemonicPhrase?: string;
  encryptedEthDerivationPath?: string;
  encryptedSubstrateDerivationPath?: string;
  cryptoType: string;
  backupAccountType: BackupAccountType[];
  encryptedSeed?: Seed;
  json?: Json;
};
