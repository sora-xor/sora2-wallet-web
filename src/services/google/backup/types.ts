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
  cryptoType: string;
  backupAccountType: BackupAccountType[];
  mnemonicPhrase: Nullable<string>;
  substrateDerivationPath: Nullable<string>;
  ethDerivationPath: Nullable<string>;
  seed: Nullable<Seed>;
  json: Nullable<Json>;
};

export type EncryptedBackupAccount = {
  name: string;
  address: string;
  cryptoType: string;
  backupAccountType: BackupAccountType[];
  encryptedMnemonicPhrase: Nullable<string>;
  encryptedEthDerivationPath: Nullable<string>;
  encryptedSubstrateDerivationPath: Nullable<string>;
  encryptedSeed: Nullable<Seed>;
  json: Nullable<Json>;
};
