'use client';

import { useState, useCallback, useEffect } from 'react';
import { WalletState } from '../types/nft';

// Simple mock for wallet interaction - normally uses window.midnight
export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Check if wallet was connected in current session store
    const stored = localStorage.getItem('midnight_wallet_address');
    if (stored) {
      setWallet({ address: stored, isConnected: true });
    }
  }, []);

  const connect = useCallback(async () => {
    // Hardcoded seed provided by user for simulation
    const hardcodedSeed = '57bb166cb6bbf3a6cb5e93a26043e3e2d3c830b63b85286fe97619456a2a23f2';
    // Using a portion of the seed as the mock address for visual feedback in the UI
    const mockAddress = `mn_addr_preprod1_${hardcodedSeed.slice(0, 32)}`;
    
    setWallet({ address: mockAddress, isConnected: true });
    localStorage.setItem('midnight_wallet_address', mockAddress);
    localStorage.setItem('midnight_wallet_seed', hardcodedSeed);
  }, []);

  const disconnect = useCallback(() => {
    setWallet({ address: null, isConnected: false });
    localStorage.removeItem('midnight_wallet_address');
  }, []);

  return {
    ...wallet,
    connect,
    disconnect,
    isClient,
  };
}
