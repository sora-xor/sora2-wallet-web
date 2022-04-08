import { Step } from '@/consts';

export interface CreateTokenData {
  title: string;
  step: Step;
  tokenSymbol: string;
  tokenName: string;
  tokenSupply: string;
  extensibleSupply: boolean;
  hasEnoughXor: boolean;
  divisible?: boolean;
}

export const MOCK_CREATE_TOKEN: Array<CreateTokenData> = [
  {
    title: 'Create Step',
    step: Step.CreateSimpleToken,
    tokenSymbol: '',
    tokenName: '',
    tokenSupply: '',
    extensibleSupply: false,
    hasEnoughXor: false,
  },
  {
    title: 'Create NFT Token Step',
    step: Step.CreateNftToken,
    tokenSymbol: '',
    tokenName: 'Token name',
    tokenSupply: '',
    extensibleSupply: true,
    hasEnoughXor: false,
  },
  {
    title: 'Confirm Simple Token Step',
    step: Step.ConfirmSimpleToken,
    tokenSymbol: 'TSYMBOL',
    tokenName: 'Token name',
    tokenSupply: '10000000000',
    extensibleSupply: true,
    hasEnoughXor: true,
  },
  {
    title: 'Confirm NFT Token Step',
    step: Step.ConfirmNftToken,
    tokenSymbol: 'TSYMBOL',
    tokenName: 'Token name',
    tokenSupply: '10000000000',
    extensibleSupply: true,
    hasEnoughXor: true,
    divisible: true,
  },
  {
    title: 'Warn Step',
    step: Step.Warn,
    tokenSymbol: 'TSYMBOL',
    tokenName: 'Token name',
    tokenSupply: '10000000000',
    extensibleSupply: true,
    hasEnoughXor: true,
  },
];
