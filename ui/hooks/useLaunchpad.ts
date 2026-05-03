'use client';
import { useState, useCallback, useEffect } from 'react';
import { CollectionInfo, NFTInfo } from '../types/nft';
import { createUnprovenCallTx, submitCallTx, createUnprovenDeployTx, submitTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
import { CostModel, sampleSigningKey } from '@midnight-ntwrk/compact-runtime';
import { getCompiledNFTContract } from '../lib/contracts';
import { UnshieldedAddress, MidnightBech32m } from '@midnight-ntwrk/wallet-sdk-address-format';



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
        // API returns array directly
        setCollections(Array.isArray(data) ? data : data.collections || []);
      }

      if (nftRes.ok) {
        const data = await nftRes.json();
        // API returns array directly
        setUserNfts(Array.isArray(data) ? data : data.nfts || []);
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
      if (!session) {
        return { success: false, error: 'No wallet session' };
      }

      const networkId = session.config.networkId;
      const callerAddressBytes = MidnightBech32m.parse(session.unshieldedAddress)
        .decode(UnshieldedAddress, networkId).data;

      // Use the utility to get the properly wrapped compiled contract
      const compiledContract = await getCompiledNFTContract('collection', callerAddressBytes);

      // Convert arguments to proper types for the contract
      const nameBytes = new Uint8Array(32);
      nameBytes.set(new TextEncoder().encode(name).slice(0, 32));
      const descBytes = new Uint8Array(64);
      descBytes.set(new TextEncoder().encode(description).slice(0, 64));
      const maxSupplyBigInt = BigInt(maxSupply);

      const deployTxData = await createUnprovenDeployTx(
        {
          zkConfigProvider: session.providers.zkConfigProvider,
          walletProvider: session.providers.walletProvider,
        },
        {
          compiledContract,
          args: [nameBytes, descBytes, maxSupplyBigInt],
          signingKey: sampleSigningKey(),
        },
      );

      console.log('[createCollection] Using submitTxAsync with full providers...');

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
          address: deployTxData.public.contractAddress,
          name,
          description,
          maxSupply,
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
      if (!session?.api) {
        return { success: false, error: 'No wallet session' };
      }

      const networkId = session.config.networkId;
      const callerAddressBytes = MidnightBech32m.parse(session.unshieldedAddress)
        .decode(UnshieldedAddress, networkId).data;

      const compiledContract = await getCompiledNFTContract('collection', callerAddressBytes);
      
      const metadataBytes = new Uint8Array(32);
      metadataBytes.set(new TextEncoder().encode(metadata).slice(0, 32));
      
      console.log('[mint] Submitting via submitCallTx...');
      
      // Use submitCallTx - it handles prove, balance, and submit
      const result = await submitCallTx(session.providers, {
        compiledContract,
        contractAddress: collectionAddress,
        circuitId: 'mint',
        args: [metadataBytes],
      });

      console.log('[mint] Result:', result);
      
      // Try to get txHash from result
      let txHash = 'Transaction submitted';
      if (result?.public?.txHash) {
        txHash = result.public.txHash;
      } else if (result?.public?.txId) {
        txHash = result.public.txId;
      }
      
      console.log('[mint] Tx hash:', txHash);
      
      // Save NFT to local state
      try {
        await fetch('/api/midnight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'add-nft',
            tokenId: Date.now().toString(),
            metadata,
            txId: txHash,
            collectionAddress,
          })
        });
      } catch (e) {
        console.error('[mint] Failed to save NFT to state:', e);
      }
      
      await fetchData();
      setIsLoading(false);
      return { success: true, txId: txHash };
    } catch (e: any) {
      console.error('[mint] Error:', e);
      setIsLoading(false);
      if (e.message?.includes('check') || e.message?.includes('proof')) {
        return { success: false, error: 'ZK proof validation failed. Try deploying a new collection.' };
      }
      return { success: false, error: e.message };
    }
  }, [fetchData]);

  const transfer = useCallback(async (session: any, tokenId: string, recipient: string) => {
    setIsLoading(true);
    try {
      const nft = userNfts.find(n => n.id === tokenId);
      if (!nft?.collectionAddress) {
        throw new Error('Cannot find collection for this token');
      }

      const networkId = session.config.networkId;
      const callerAddressBytes = MidnightBech32m.parse(session.unshieldedAddress)
        .decode(UnshieldedAddress, networkId).data;

      const compiledContract = await getCompiledNFTContract('collection', callerAddressBytes);
      
      const recipientBytes = new Uint8Array(32);
      try {
        recipientBytes.set(Buffer.from(recipient.replace('0x', ''), 'hex').slice(0, 32));
      } catch (e) {}

      const result = await submitCallTx(session.providers, {
        compiledContract,
        contractAddress: nft.collectionAddress,
        privateStateId: nft.collectionAddress,
        circuitId: 'transfer',
        args: [BigInt(tokenId), recipientBytes, new Uint8Array(32)],
      });

      await fetchData();
      return { success: true, txId: result.public.txHash || result.public.txId };
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

      const networkId = session.config.networkId;
      const callerAddressBytes = MidnightBech32m.parse(session.unshieldedAddress)
        .decode(UnshieldedAddress, networkId).data;

      const compiledContract = await getCompiledNFTContract('collection', callerAddressBytes);
      
      const result = await submitCallTx(session.providers, {
        compiledContract,
        contractAddress: nft.collectionAddress,
        circuitId: 'verifyOwnership',
        args: [BigInt(tokenId), new Uint8Array(32)],
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
