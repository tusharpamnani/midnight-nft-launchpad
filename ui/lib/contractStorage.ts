import { ContractInfo } from '../types/wallet';

const CONTRACTS_PREFIX = 'midnight_contracts:';

export const contractStorage = {
  getContracts: (walletAddress: string): ContractInfo[] => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(`${CONTRACTS_PREFIX}${walletAddress}`);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveContract: (walletAddress: string, contractAddress: string) => {
    if (typeof window === 'undefined') return;
    try {
      const current = contractStorage.getContracts(walletAddress);
      if (!current.some(c => c.address === contractAddress)) {
        const updated = [...current, { address: contractAddress, createdAt: Date.now() }];
        localStorage.setItem(`${CONTRACTS_PREFIX}${walletAddress}`, JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Failed to save contract to storage', e);
    }
  },

  deleteContract: (walletAddress: string, contractAddress: string) => {
    if (typeof window === 'undefined') return;
    try {
      const current = contractStorage.getContracts(walletAddress);
      const filtered = current.filter(c => c.address !== contractAddress);
      localStorage.setItem(`${CONTRACTS_PREFIX}${walletAddress}`, JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to delete contract from storage', e);
    }
  }
};
