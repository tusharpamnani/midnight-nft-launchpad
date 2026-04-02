'use client';

import { useState, useCallback, useEffect } from 'react';
import { 
  fetchOwnedNFTs, 
  actionMint, 
  actionTransfer, 
  actionVerify, 
  getDeployment 
} from '../app/actions';
import { OwnedNFT } from '../types/nft';

export function useNFT(contractAddress: string | null) {
  const [nfts, setNfts] = useState<OwnedNFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Use server action to refresh state from backend local-state.json
  const refreshNFTs = useCallback(async () => {
    try {
      const data = await fetchOwnedNFTs();
      setNfts(data as OwnedNFT[]);
    } catch (e) {
      console.error("Failed to fetch backend state", e);
    }
  }, []);

  useEffect(() => {
    refreshNFTs();
    // Poll for status updates since transactions are asynchronous
    const interval = setInterval(refreshNFTs, 5000);
    return () => clearInterval(interval);
  }, [refreshNFTs]);

  const mint = useCallback(async (metadata: string) => {
    setIsLoading(true);
    try {
      const res = await actionMint(metadata);
      await refreshNFTs();
      return res;
    } finally {
      setIsLoading(false);
    }
  }, [refreshNFTs]);

  const transfer = useCallback(async (tokenId: string, recipient: string) => {
    setIsLoading(true);
    try {
      const res = await actionTransfer(tokenId, recipient);
      await refreshNFTs();
      return res;
    } finally {
      setIsLoading(false);
    }
  }, [refreshNFTs]);

  const verify = useCallback(async (tokenId: string) => {
    setIsLoading(true);
    try {
      const res = await actionVerify(tokenId);
      return res;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    nfts,
    mint,
    transfer,
    verify,
    isLoading,
    refreshNFTs
  };
}
