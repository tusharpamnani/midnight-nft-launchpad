'use client';

import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import {
  type MidnightProvider,
  type PrivateStateProvider,
  type WalletProvider,
} from '@midnight-ntwrk/midnight-js-types';

export type ConnectedSession = {
  api: any;
  config: any;
  providers: {
    privateStateProvider: PrivateStateProvider<string, any>;
    zkConfigProvider: any;
    proofProvider: any;
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

  // Use the wallet's proving provider directly (it already handles ZK config)
  const proofProvider = await api.getProvingProvider();

  const privateStateProvider = createPrivateStateProvider();

  const walletProvider: WalletProvider = {
    balanceTx: async (tx: any) => {
      const txHex = toHex(tx.serialize());
      const balanced = await api.balanceUnsealedTransaction(txHex);
      return (await import('@midnight-ntwrk/ledger-v8')).Transaction.deserialize('signature', 'proof', 'binding', fromHex(balanced.tx));
    },
    getCoinPublicKey: () => shieldedAddress.shieldedCoinPublicKey,
    getEncryptionPublicKey: () => shieldedAddress.shieldedEncryptionPublicKey,
  };

  const midnightProvider: MidnightProvider = {
    submitTx: async (tx: any) => {
      const txHex = toHex(tx.serialize());
      const txId = await api.submitTransaction(txHex);
      return txId ?? '';
    },
  };

  // ZK config provider that fetches from server API
  const zkConfigProvider = {
    getZkConfig: async (circuitId: string) => {
      const response = await fetch(`/api/zk-config?circuitId=${circuitId}`);
      if (!response.ok) throw new Error('Failed to fetch ZK config');
      return response.json();
    }
  };

  return {
    api,
    config,
    providers: {
      privateStateProvider,
      zkConfigProvider,
      proofProvider,
      walletProvider,
      midnightProvider,
    },
    unshieldedAddress: unshieldedAddress.unshieldedAddress,
  };
}
