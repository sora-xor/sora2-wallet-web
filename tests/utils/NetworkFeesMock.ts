import { Operation } from '@sora-substrate/sdk';

export const MOCK_NETWORK_FEES = {
  [Operation.AddLiquidity]: '7000000000000000',
  [Operation.CreatePair]: '700000000000000000',
  [Operation.EthBridgeOutgoing]: '7000000000000000',
  [Operation.RegisterAsset]: '7000000000000000',
  [Operation.RemoveLiquidity]: '7000000000000000',
  [Operation.Swap]: '7000000000000000',
  [Operation.SwapAndSend]: '70000000000000000',
  [Operation.Transfer]: '7000000000000000',
  [Operation.ClaimVestedRewards]: '70000000000000000',
  [Operation.ClaimLiquidityProvisionRewards]: '7000000000000000',
  [Operation.ClaimExternalRewards]: '7000000000000000',
};
