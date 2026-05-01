'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '../../hooks/useWallet';
import { useContract } from '../../hooks/useContract';
import { useLaunchpad } from '../../hooks/useLaunchpad';
import WalletConnect from '../../components/WalletConnect';
import CollectionList from '../../components/CollectionList';
import MintForm from '../../components/MintForm';
import NFTList from '../../components/NFTList';
import CreateCollectionModal from '../../components/CreateCollectionModal';
import { PlusCircle, Box, ArrowUpRight } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { isConnected, isConnecting, walletStatus, session } = useWallet();
  const { deployment, isDeploying } = useContract();
  const { collections, userNfts, mint, transfer, verify, isLoading, refreshData, createCollection } = useLaunchpad();
  const [selectedContract, setSelectedContract] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!isConnected && walletStatus !== 'checking') {
      router.push('/');
    }
  }, [isConnected, walletStatus, router]);

  if (!isConnected) return null;

  return (
    <>
      <main className="min-h-screen bg-[#080810] text-zinc-100">
        {/* Nav */}
        <nav className="border-b sticky top-0 z-40" style={{ borderColor: 'rgba(255,255,255,0.04)', background: 'rgba(8,8,16,0.8)', backdropFilter: 'blur(20px)' }}>
          <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
            <span className="text-[13px] font-syne font-bold tracking-[0.15em] text-white uppercase">Midnight</span>
            <WalletConnect />
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-8 py-16 space-y-16">
          {/* Header */}
          <div>
            <h1 className="text-[48px] font-dm-serif text-white">Dashboard</h1>
            <p className="text-zinc-500 mt-2">Manage your NFT collections and minted tokens</p>
          </div>

          {/* Contract Status */}
          {deployment && (
            <div className="p-8 border border-white/[0.06]">
              <h2 className="text-[32px] font-dm-serif text-white mb-4">Contract Status</h2>
              <div className="flex items-center gap-8 text-[10px] font-mono tracking-[0.2em] text-zinc-600">
                <a href={`https://explorer.1am.xyz/contract/${deployment.contractAddress}`} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity text-zinc-400">
                  Contract: {deployment.contractAddress.slice(0, 8)}...{deployment.contractAddress.slice(-6)}
                  <ArrowUpRight className="inline w-2.5 h-2.5 ml-1" />
                </a>
                <div className="w-px h-3 bg-white/[0.1]" />
                <span>Block: #{deployment.blockHeight || '—'}</span>
                <div className="w-px h-3 bg-white/[0.1]" />
                <span className="text-emerald-400">Active</span>
              </div>
            </div>
          )}

          {/* Collections */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[32px] font-dm-serif text-white">Collections</h2>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 border border-violet-500/30 bg-violet-500/[0.06] hover:bg-violet-500/[0.12] text-violet-300 font-mono text-[11px] tracking-[0.2em] uppercase px-4 py-2 transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                New Collection
              </button>
            </div>
            <CollectionList
              collections={collections}
              selectedAddress={selectedContract}
              onSelect={setSelectedContract}
            />
          </div>

          {/* Mint & Manage */}
          <div className="space-y-6">
            <h2 className="text-[32px] font-dm-serif text-white">Mint & Manage</h2>
            {!selectedContract ? (
              <div className="p-12 text-center border border-white/[0.06]">
                <Box className="w-8 h-8 mx-auto mb-4 text-white/[0.15]" />
                <p className="text-[12px] font-mono tracking-[0.2em] text-zinc-600">
                  Select a collection above to mint NFTs
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="relative p-8 space-y-6 border border-white/[0.06]">
                  <div className="absolute top-0 left-0 right-0 h-px bg-[#0000FE]" />
                  <h3 className="text-lg font-syne font-bold text-white">Mint NFT</h3>
                  <MintForm onMint={(metadata) => mint(session, selectedContract, metadata)} isLoading={isLoading} addLog={() => { }} />
                </div>
                <div className="relative p-8 space-y-6 border border-white/[0.06]">
                  <div className="absolute top-0 left-0 right-0 h-px bg-[#0000FE]" />
                  <h3 className="text-lg font-syne font-bold text-white">Your NFTs</h3>
                  <NFTList
                    nfts={userNfts.filter(nft => nft.collectionAddress === selectedContract)}
                    onVerify={(tokenId) => verify(session, tokenId)}
                    onTransfer={(tokenId, recipient) => transfer(session, tokenId, recipient)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Collection Modal */}
      <CreateCollectionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={(name, desc, supply) => {
          if (session) {
            return createCollection(session, name, desc, supply);
          }
          return { success: false, error: 'No session' };
        }}
        isLoading={isDeploying}
      />
    </>
  );
}
