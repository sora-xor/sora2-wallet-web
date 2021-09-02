enum Step {
  Create,
  Confirm
}

export interface CreateTokenData {
  title: string;
  step: Step;
  tokenSymbol: string;
  tokenName: string;
  tokenSupply: string;
  extensibleSupply: boolean;
  hasEnoughXor: boolean;
}

export const MOCK_CREATE_TOKEN: Array<CreateTokenData> = [
  {
    title: 'Create Step',
    step: Step.Create,
    tokenSymbol: '',
    tokenName: '',
    tokenSupply: '',
    extensibleSupply: false,
    hasEnoughXor: false
  },
  {
    title: 'Confirm Step',
    step: Step.Confirm,
    tokenSymbol: 'TSYMBOL',
    tokenName: 'Token name',
    tokenSupply: '10000000000',
    extensibleSupply: true,
    hasEnoughXor: true
  }
]
