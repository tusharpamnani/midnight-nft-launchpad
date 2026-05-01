'use client';

// Guard against server-side execution
if (typeof window === 'undefined') {
  console.warn('midnight.ts: Attempted to load on server-side, aborting');
  throw new Error('midnight.ts should only be loaded on the client-side');
}

import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import {
  createProofProvider,
  type MidnightProvider,
  type PrivateStateProvider,
  type WalletProvider,
  type ProofProvider,
} from '@midnight-ntwrk/midnight-js-types';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';

export type ConnectedSession = {
  api: any;
  config: any;
  providers: {
    privateStateProvider: PrivateStateProvider<string, any>;
    publicDataProvider: any;
    zkConfigProvider: any;
    proofProvider: ProofProvider;
    walletProvider: WalletProvider;
    midnightProvider: MidnightProvider;
  };
  unshieldedAddress: string;
};

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex: string): Uint8Array {
  const normalized = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (normalized.length % 2 !== 0) {
    throw new Error('Received an invalid hex string from the wallet.');
  }
  const bytes = new Uint8Array(normalized.length / 2);
  for (let index = 0; index < normalized.length; index += 2) {
    bytes[index / 2] = Number.parseInt(normalized.slice(index, index + 2), 16);
  }
  return bytes;
}

function createPrivateStateProvider() {
  let contractAddressScope = '';
  const stateStore = new Map<string, any>();

  const scopedStateKey = (privateStateId: string) => `${contractAddressScope}:${privateStateId}`;

  return {
    setContractAddress(address: string) {
      contractAddressScope = address;
    },
    async set(privateStateId: string, state: any) {
      stateStore.set(scopedStateKey(privateStateId), state);
    },
    async get(privateStateId: string) {
      return stateStore.get(scopedStateKey(privateStateId)) ?? null;
    },
    async remove(privateStateId: string) {
      stateStore.delete(scopedStateKey(privateStateId));
    },
    async clear() {
      stateStore.clear();
    },
    async setSigningKey(address: string, signingKey: any) {
      stateStore.set(`signingKey:${address}`, signingKey);
    },
    async getSigningKey(address: string) {
      return stateStore.get(`signingKey:${address}`) ?? null;
    },
    async removeSigningKey(address: string) {
      stateStore.delete(`signingKey:${address}`);
    },
    async clearSigningKeys() {
      Array.from(stateStore.keys())
        .filter(key => key.startsWith('signingKey:'))
        .forEach(key => stateStore.delete(key));
    },
    async exportPrivateStates(): Promise<never> {
      throw new Error('Private state export is not implemented.');
    },
    async importPrivateStates(): Promise<never> {
      throw new Error('Private state import is not implemented.');
    },
    async exportSigningKeys(): Promise<never> {
      throw new Error('Signing key export is not implemented.');
    },
    async importSigningKeys(): Promise<never> {
      throw new Error('Signing key import is not implemented.');
    },
  } as PrivateStateProvider<string, any>;
}

export async function createConnectedSession(api: any): Promise<ConnectedSession> {
  const [config, unshieldedAddress, shieldedAddress] = await Promise.all([
    api.getConfiguration(),
    api.getUnshieldedAddress(),
    api.getShieldedAddresses(),
  ]);

  setNetworkId(config.networkId);

  // Use FetchZkConfigProvider with static files served from /contract/collection/
  // The provider fetches: {baseUrl}/keys/{circuitId}.verifier and {baseUrl}/zkir/{circuitId}.bzkir
  const baseUrl = new URL('/contract/collection', window.location.origin).toString();
  console.log('[zkConfigProvider] Creating with baseUrl:', baseUrl);
  
  const zkConfigProvider = new FetchZkConfigProvider(
    baseUrl,
    window.fetch.bind(window),
  );
  
  // Test if the provider can fetch artifacts
  zkConfigProvider.getZKIR('mint').then(
    (zkir) => console.log('[zkConfigProvider] getZKIR test success, length:', zkir?.length),
    (err) => console.error('[zkConfigProvider] getZKIR test failed:', err)
  );

  // Get the ProvingProvider from wallet
  const provingProvider = await api.getProvingProvider(zkConfigProvider);
  
  // Create a proofProvider that has proveTx method
  // submitCallTx expects proofProvider.proveTx(unprovenTx, config)
  const proofProvider = {
    async proveTx(unprovenTx: any, _config: any) {
      const { CostModel } = await import('@midnight-ntwrk/ledger-v8');
      return unprovenTx.prove(provingProvider, CostModel.initialCostModel());
    },
  };

  const privateStateProvider = createPrivateStateProvider();

   const walletProvider: WalletProvider = {
    balanceTx: async (tx: any) => {
      try {
        const txHex = toHex(tx.serialize());
        console.log('[walletProvider] Balancing tx, hex length:', txHex.length);
        const balanced = await api.balanceUnsealedTransaction(txHex);
        console.log('[walletProvider] Tx balanced, result:', balanced);
        
        // Check if balanced.tx is valid
        if (!balanced || !balanced.tx) {
          throw new Error('balanceUnsealedTransaction returned invalid result: ' + JSON.stringify(balanced));
        }
        
        const { Transaction } = await import('@midnight-ntwrk/ledger-v8');
        const bytes = new Uint8Array(balanced.tx.match(/.{2}/g).map((b: string) => parseInt(b, 16)));
        const balancedTx = Transaction.deserialize('signature', 'proof', 'binding', bytes);
        console.log('[walletProvider] Balanced tx deserialized, new hex length:', toHex(balancedTx.serialize()).length);
        return balancedTx;
      } catch (e: any) {
        console.error('[walletProvider] Balance error:', e);
        throw e;
      }
    },
    getCoinPublicKey: () => shieldedAddress.shieldedCoinPublicKey,
    getEncryptionPublicKey: () => shieldedAddress.shieldedEncryptionPublicKey,
  };

   const midnightProvider: MidnightProvider = {
    submitTx: async (tx: any) => {
      try {
        console.log('[midnightProvider] Transaction keys:', Object.keys(tx));
        const txHex = toHex(tx.serialize());
        console.log('[midnightProvider] Submitting tx, hex length:', txHex.length);
        
        // Use the wallet's submitTransaction directly like 1AM template
        const result = await api.submitTransaction(txHex);
        console.log('[midnightProvider] Submit result:', result);
        
        // Extract txId from result, or try to get it from the transaction object itself
        // In some versions of the SDK, tx.id is a Uint8Array hash
        const txIdFromObject = tx.id ? toHex(tx.id) : (tx.hash ? toHex(tx.hash) : '');
        const txId = (typeof result === 'string' ? result : result?.transactionId || result?.id || txIdFromObject) || '';
        
        console.log('[midnightProvider] Final txId:', txId);
        return txId;
      } catch (e: any) {
        console.error('[midnightProvider] Submission error:', e);
        throw e;
      }
    },
  };

  // Public data provider for querying on-chain state (required by createUnprovenCallTx)
  // Uses the indexer public data provider from the Midnight indexer
  const indexerQueryURL = process.env.NEXT_PUBLIC_INDEXER_URI || 'https://indexer.preprod.midnight.network/api/v4/graphql';
  const indexerSubURL = process.env.NEXT_PUBLIC_INDEXER_WS_URI || 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws';
  // Use native WebSocket in browser environments
  const WS = typeof window !== 'undefined' ? window.WebSocket : undefined;
  const publicDataProvider = indexerPublicDataProvider(indexerQueryURL, indexerSubURL, WS as any);

  return {
    api,
    config,
    providers: {
      privateStateProvider,
      publicDataProvider,
      zkConfigProvider,
      proofProvider,
      walletProvider,
      midnightProvider,
    },
    unshieldedAddress: unshieldedAddress.unshieldedAddress,
  };
}
