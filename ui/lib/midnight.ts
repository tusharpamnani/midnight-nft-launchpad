import * as ledger from '@midnight-ntwrk/ledger-v8';
import { CompiledContract, Contract as CompactContract } from '@midnight-ntwrk/compact-js';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';

// For browser environment, we'll need to adapt these
// In a real browser app, we use the Lace wallet extension
// For now, we'll setup the configuration

export const CONFIG = {
  indexer: 'https://indexer.preprod.midnight.network/api/v3/graphql',
  indexerWS: 'wss://indexer.preprod.midnight.network/api/v3/graphql/ws',
  node: 'https://rpc.preprod.midnight.network',
  proofServer: 'http://127.0.0.1:6300', // Note: browser might need a proxy or local proof server
} as const;

setNetworkId('preprod');

// This needs to be relative to the public folder or absolute for Node
export const zkConfigPath = '/contracts/managed/contract';

// Helper to get the contract module (this will be loaded dynamically in browser)
export async function loadContractModule() {
  const module = await import('../contracts/managed/contract/contract/index.js');
  return module;
}

export async function getNFTContractModule() {
  return await loadContractModule();
}

export function getCompiledContract(NFTContractCtor: any, walletAddressBytes: Uint8Array) {
  return (CompiledContract.make(
    'contract',
    NFTContractCtor,
  ) as any).pipe(
    // @ts-ignore
    CompiledContract.withWitnesses({
      callerAddress: (context: any) => [context.privateState, walletAddressBytes]
    }),
    // @ts-ignore
    CompiledContract.withCompiledFileAssets(zkConfigPath),
  );
}

// Browser-friendly provider setup
export async function createBrowserProviders(
  walletProvider: any, // This would be the Lace/Midnight wallet provider from window
  accountId: string,
  privateStatePasswordProvider: () => string
) {
  // Use a different private state provider for browser if needed, 
  // but levelPrivateStateProvider can work in-memory or with some adapters
  
  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath); // Browser might need a fetch-based provider

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'nft-mint-ui-state',
      accountId,
      privateStoragePasswordProvider: privateStatePasswordProvider,
    }),
    publicDataProvider: indexerPublicDataProvider(
      CONFIG.indexer,
      CONFIG.indexerWS,
    ),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(CONFIG.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };
}
