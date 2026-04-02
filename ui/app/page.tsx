'use client';

import { useContract } from '../hooks/useContract';
import { useNFT } from '../hooks/useNFT';
import { useWallet } from '../hooks/useWallet';
import WalletConnect from '../components/WalletConnect';
import MintForm from '../components/MintForm';
import NFTList from '../components/NFTList';
import { Rocket, History, LayoutDashboard, Terminal, RefreshCw, Zap, ShieldCheck } from 'lucide-react';

export default function Home() {
  const { deployment, deploy, log, addLog } = useContract();
  const { nfts, mint, transfer, verify, isLoading, refreshNFTs } = useNFT(deployment?.contractAddress || null);
  const { isConnected, isClient } = useWallet();

  if (!isClient) return null;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30 font-sans relative overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 bg-grid -z-10 opacity-30 pointer-events-none"></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full -z-10 pointer-events-none animate-pulse duration-[10s]"></div>
      {/* Navbar */}
      <nav className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 group">
            <div className="bg-indigo-600 rounded-xl p-2 group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-600/30">
              <Zap className="w-6 h-6 text-white fill-current" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display tracking-tight text-zinc-100">Midnight NFT</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Live Network: Preprod</span>
              </div>
            </div>
          </div>
          <WalletConnect />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-12">
        {/* Header / Deploy Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-zinc-900">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-4xl font-extrabold font-display tracking-tight text-white mb-2">
              Privacy-Preserving NFT <span className="text-indigo-500">ZK Foundry</span>
            </h2>
            <p className="text-zinc-500 leading-relaxed max-w-lg">
              Generate Zero-Knowledge proofs locally to mint NFTs with hidden metadata.
              Your assets are publicly verifiable but only you know their true state.
            </p>
          </div>

          <div className="flex flex-col gap-3 min-w-[320px]">
             {deployment ? (
               <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 translate-x-2 -translate-y-2 group-hover:scale-125 transition-all">
                    <ShieldCheck className="w-16 h-16 text-indigo-500" />
                 </div>
                 <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">Active Contract</p>
                 <code className="text-xs font-mono text-indigo-400 block break-all mb-4">
                  {deployment.contractAddress}
                 </code>
                 <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-bold bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                   <History className="w-3 h-3" />
                   Deployed {new Date(deployment.deployedAt).toLocaleDateString()}
                 </div>
               </div>
             ) : (
               <button
                 onClick={() => deploy()}
                 className="group flex flex-col items-center justify-center gap-3 border border-zinc-800 bg-zinc-950 hover:bg-zinc-900/60 p-8 rounded-2xl transition-all hover:border-indigo-600/30"
               >
                 <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 transition-all shadow-xl shadow-black/50">
                    <Rocket className="w-6 h-6 text-zinc-400 group-hover:text-white" />
                 </div>
                 <div className="text-center">
                    <span className="block text-zinc-100 font-bold text-lg leading-none mb-1">Initialize Contract</span>
                    <span className="text-zinc-600 text-xs font-medium">Standard Midnight NFT Registry</span>
                 </div>
               </button>
             )}
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Controls - 2 cols */}
          <div className="lg:col-span-2 space-y-12">
            {!isConnected ? (
              <div className="p-12 text-center bg-zinc-950/40 border border-zinc-800 rounded-2xl">
                 <h3 className="text-2xl font-bold font-display text-zinc-300">Connect Wallet to Begin</h3>
                 <p className="text-zinc-500 mt-2 mb-6">Interaction requires an active connection to your Lace wallet.</p>
                 <WalletConnect />
              </div>
            ) : (
              <>
                <section>
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-2">
                       <LayoutDashboard className="w-5 h-5 text-indigo-500" />
                       <h3 className="text-2xl font-bold font-display text-white">Your Private Collection</h3>
                    </div>
                    <button 
                      onClick={refreshNFTs}
                      className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-all hover:text-zinc-100 h-10 w-10 flex items-center justify-center"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  <NFTList 
                    nfts={nfts} 
                    onVerify={verify} 
                    onTransfer={transfer} 
                  />
                </section>

                <section>
                   <MintForm onMint={mint} isLoading={isLoading} addLog={addLog} />
                </section>
              </>
            )}
          </div>

          {/* Sidebar / Logs */}
          <aside className="space-y-6">
             <div className="bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col h-[600px] shadow-2xl relative">
                <div className="flex items-center gap-2 p-5 border-b border-zinc-900 bg-zinc-900/30 rounded-t-2xl">
                   <Terminal className="w-4 h-4 text-emerald-500" />
                   <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Activity Logs</h4>
                </div>
                
                <div className="flex-1 overflow-y-auto p-5 font-mono text-[11px] leading-relaxed space-y-3 custom-scrollbar">
                  {log.length === 0 ? (
                    <p className="text-zinc-700 italic">No activity yet. Logs will appear here.</p>
                  ) : (
                    log.map((entry, i) => (
                      <div key={i} className="text-zinc-500 border-l border-zinc-800 pl-3">
                        {entry}
                      </div>
                    ))
                  )}
                </div>

                <div className="p-4 border-t border-zinc-900 bg-zinc-950 rounded-b-2xl">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                     <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">Proof Generation Status: Idle</span>
                  </div>
                </div>
             </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
