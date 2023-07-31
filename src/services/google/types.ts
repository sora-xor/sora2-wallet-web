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

export type DecryptedBackupAccount = {
  name: string;
  address: string;
  mnemonicPhrase: Nullable<string>;
  cryptoType: string;
  substrateDerivationPath: Nullable<string>;
  ethDerivationPath: Nullable<string>;
  backupAccountType: BackupAccountType[];
  seed: Nullable<Seed>;
  json: Nullable<Json>;
};

export type EncryptedBackupAccount = {
  name: string;
  address: string;
  encryptedMnemonicPhrase: Nullable<string>;
  encryptedEthDerivationPath: Nullable<string>;
  encryptedSubstrateDerivationPath: Nullable<string>;
  cryptoType: string;
  backupAccountType: BackupAccountType[];
  encryptedSeed: Nullable<Seed>;
  json: Nullable<Json>;
};
