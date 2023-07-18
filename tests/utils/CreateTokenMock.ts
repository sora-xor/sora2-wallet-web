import { Step } from '@/consts';

export interface CreateTokenData {
  title: string;
  step: Step;
}

export const MOCK_CREATE_TOKEN: Array<CreateTokenData> = [
  {
    title: 'Create Step',
    step: Step.CreateSimpleToken,
  },
  {
    title: 'Create NFT Token Step',
    step: Step.CreateNftToken,
  },
  {
    title: 'Confirm Simple Token Step',
    step: Step.ConfirmSimpleToken,
  },
  {
    title: 'Confirm NFT Token Step',
    step: Step.ConfirmNftToken,
  },
  {
    title: 'Warn Step',
    step: Step.Warn,
  },
];
