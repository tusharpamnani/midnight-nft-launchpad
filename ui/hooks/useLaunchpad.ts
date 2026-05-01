'use client';

import { useState, useCallback, useEffect } from 'react';
import { CollectionInfo, NFTInfo } from '../types/nft';
import { createUnprovenCallTx, submitTxAsync, createUnprovenDeployTx } from '@midnight-ntwrk/midnight-js-contracts';
import { sampleSigningKey } from '@midnight-ntwrk/compact-runtime';

export function useLaunchpad() {
  const [collections, setCollections] = useState<CollectionInfo[]>([]);
  const [userNfts, setUserNfts] = useState<NFTInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [colRes, nftRes] = await Promise.all([
        fetch('/api/midnight?action=collections'),
        fetch('/api/midnight?action=owned-nfts')
      ]);

      if (colRes.ok) {
        const data = await colRes.json();
        setCollections(data.collections || []);
      }

      if (nftRes.ok) {
        const data = await nftRes.json();
        setUserNfts(data.nfts || []);
      }
    } catch (e) {
      console.error('Error fetching data:', e);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createCollection = useCallback(async (session: any, name: string, description: string, maxSupply: number) => {
    setIsLoading(true);
    try {
      const contractModule = await import('../src/contracts/collection/contract/index.js');
      const { Contract: CompiledContract } = contractModule;
      
      const deployTxData = await createUnprovenDeployTx(
        {
          zkConfigProvider: session.providers.zkConfigProvider,
          walletProvider: session.providers.walletProvider,
        },
        {
          compiledContract: { Contract: CompiledContract },
          args: [name, description, maxSupply],
          signingKey: sampleSigningKey(),
        },
      );

      const txId = await submitTxAsync(
        session.providers,
        {
          unprovenTx: deployTxData.private.unprovenTx,
        },
      );

      // Save signing key
      await session.providers.privateStateProvider.setContractAddress(deployTxData.public.contractAddress);
      await session.providers.privateStateProvider.setSigningKey(
        deployTxData.public.contractAddress,
        deployTxData.private.signingKey,
      );

      // Register in base contract via server API
      await fetch('/api/midnight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add-collection',
          address: deployTxData.public.contractAddress
        })
      });

      await fetchData();
      return { success: true, contractAddress: deployTxData.public.contractAddress };
    } catch (e: any) {
      console.error('Error creating collection:', e);
      return { success: false, error: e.message };
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

  const mint = useCallback(async (session: any, collectionAddress: string, metadata: string) => {
    setIsLoading(true);
    try {
      const contractModule = await import('../src/contracts/collection/contract/index.js');
      const { Contract: CompiledContract } = contractModule;
      
      const metadataHash = Buffer.from(metadata).toString('hex');
      
      const callTxData = await createUnprovenCallTx(
        session.providers,
        {
          compiledContract: { Contract: CompiledContract },
          contractAddress: collectionAddress,
          circuitId: 'mint',
          args: [metadataHash],
        },
      );

      const txId = await submitTxAsync(session.providers, {
        unprovenTx: callTxData.private.unprovenTx,
        circuitId: 'mint',
      });

      await fetchData();
      return { success: true, txId };
    } catch (e: any) {
      console.error('Error minting:', e);
      return { success: false, error: e.message };
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

  const transfer = useCallback(async (session: any, tokenId: string, recipient: string) => {
    setIsLoading(true);
    try {
      const nft = userNfts.find(n => n.id === tokenId);
      if (!nft?.collectionAddress) {
        throw new Error('Cannot find collection for this token');
      }

      const contractModule = await import('../src/contracts/collection/contract/index.js');
      const { Contract: CompiledContract } = contractModule;
      
      const callTxData = await createUnprovenCallTx(
        session.providers,
        {
          compiledContract: { Contract: CompiledContract },
          contractAddress: nft.collectionAddress,
          circuitId: 'transfer',
          args: [tokenId, recipient],
        },
      );

      await submitTxAsync(session.providers, {
        unprovenTx: callTxData.private.unprovenTx,
        circuitId: 'transfer',
      });

      await fetchData();
      return { success: true };
    } catch (e: any) {
      console.error('Error transferring:', e);
      return { success: false, error: e.message };
    } finally {
      setIsLoading(false);
    }
  }, [userNfts, fetchData]);

  const verify = useCallback(async (session: any, tokenId: string) => {
    try {
      const nft = userNfts.find(n => n.id === tokenId);
      if (!nft?.collectionAddress) {
        throw new Error('Cannot find collection for this token');
      }

      const contractModule = await import('../src/contracts/collection/contract/index.js');
      const { Contract: CompiledContract } = contractModule;
      
      const callTxData = await createUnprovenCallTx(
        session.providers,
        {
          compiledContract: { Contract: CompiledContract },
          contractAddress: nft.collectionAddress,
          circuitId: 'verify',
          args: [tokenId],
        },
      );

      const result = await submitTxAsync(session.providers, {
        unprovenTx: callTxData.private.unprovenTx,
        circuitId: 'verify',
      });

      return { success: true, result };
    } catch (e: any) {
      console.error('Error verifying:', e);
      return { success: false, error: e.message };
    }
  }, [userNfts]);

  return {
    collections,
    userNfts,
    createCollection,
    mint,
    transfer,
    verify,
    isLoading,
    refreshData: fetchData,
  };
}
