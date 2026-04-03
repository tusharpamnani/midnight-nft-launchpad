import * as fs from 'node:fs';
import crypto from 'node:crypto';

import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { 
  createWallet, 
  createProviders, 
  getCompiledNFTContract 
} from './utils.js';

export async function deploy(seed: string) {
  console.log('Connecting and syncing wallet...');
  const walletCtx = await createWallet(seed);
  await walletCtx.wallet.waitForSyncedState();

  console.log('Setting up providers...');
  const providers = await createProviders(walletCtx);

  const walletAddressString = walletCtx.unshieldedKeystore.getBech32Address().toString();
  const callerAddressBytes = crypto.createHash('sha256').update(walletAddressString).digest();

  console.log('Deploying registry contract (this may take 30-60 seconds)...');
  const deployed = await deployContract(providers, {
    compiledContract: await getCompiledNFTContract('contract', callerAddressBytes),
    args: [],
  });


  const contractAddress = deployed.deployTxData.public.contractAddress;
  console.log('✅ Contract deployed successfully!');
  console.log(`Contract Address: ${contractAddress}`);

  const deploymentInfo = {
    contractAddress,
    seed,
    network: 'preprod',
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
  console.log('Saved to deployment.json');
  
  await walletCtx.wallet.stop();
}