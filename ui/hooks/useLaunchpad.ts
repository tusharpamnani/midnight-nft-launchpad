'use client';

import { useState, useCallback, useEffect } from 'react';
import { OwnedNFT } from '../types/nft';

export interface Collection {
  id: string;
  name: string;
  description: string;
  maxSupply: number;
  contractAddress: string;
  creatorAddress: string;
  createdAt: string;
}

export function useLaunchpad() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [userNfts, setUserNfts] = useState<OwnedNFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = useCallback(async () => {
    try {
      const [colsRes, nftsRes] = await Promise.all([
        fetch('/api/midnight?action=collections'),
        fetch('/api/midnight?action=owned-nfts')
      ]);
      const [cols, nfts] = await Promise.all([colsRes.json(), nftsRes.json()]);
      setCollections(cols);
      setUserNfts(nfts);
    } catch (e) {
      console.error("Failed to refresh launchpad data", e);
    }
  }, []);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 10000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const createCollection = useCallback(async (name: string, description: string, maxSupply: number) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/midnight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-collection', name, description, maxSupply })
      });
      await refreshData();
      return await res.json();
    } catch (e: any) {
      console.error('Collection creation failed:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [refreshData]);

  const mint = useCallback(async (collectionAddress: string, metadata: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/midnight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mint-from-collection', collectionAddress, metadata })
      });
      await refreshData();
      return await res.json();
    } catch (e: any) {
      console.error('Mint failed:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [refreshData]);

  const transfer = useCallback(async (tokenId: string, recipient: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/midnight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'transfer', tokenId, recipient })
      });
      await refreshData();
      return await res.json();
    } catch (e: any) {
      console.error('Transfer failed:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [refreshData]);

  const verify = useCallback(async (tokenId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/midnight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', tokenId })
      });
      return await res.json();
    } catch (e: any) {
      console.error('Verify failed:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    collections,
    userNfts,
    createCollection,
    mint,
    transfer,
    verify,
    isLoading,
    refreshData
  };
}
