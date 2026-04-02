'use client';

import { useState, useEffect } from 'react';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import WalletConnect from '../components/WalletConnect';
import ContractSelector from '../components/ContractSelector';
import LaunchpadForm from '../components/LaunchpadForm';
import CollectionList from '../components/CollectionList';
import MintForm from '../components/MintForm';
import NFTList from '../components/NFTList';
import { useLaunchpad } from '../hooks/useLaunchpad';
import { Rocket, History, LayoutDashboard, Terminal, RefreshCw, Zap, ShieldCheck, Wallet, Lock, PlusCircle, LayoutGrid, Box } from 'lucide-react';

export default function Home() {
  const { deployment, deploy, log, addLog } = useContract();
  const { isConnected, isClient, address } = useWallet();
  const [selectedContract, setSelectedContract] = useState<string | null>(null);
  const { collections, userNfts, createCollection, mint, isLoading, refreshData } = useLaunchpad();

  useEffect(() => {
    // If the selected contract is the base contract (which has 3 ledger entries),
    // we clear the selection. The Launchpad (Collections) logic requires 7 ledger entries.
    // This prevents stale state from causing a crash if the user doesn't refresh.
    if (selectedContract && deployment?.contractAddress && selectedContract === deployment.contractAddress) {
      setSelectedContract(null);
    }
  }, [selectedContract, deployment]);

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
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-8 animate-in zoom-in-95 fade-in duration-500">
             <div className="w-24 h-24 bg-indigo-600/10 rounded-3xl flex items-center justify-center relative">
                <Lock className="w-10 h-10 text-indigo-500" />
                <div className="absolute inset-0 bg-indigo-500/10 blur-xl animate-pulse"></div>
             </div>
             <div className="text-center space-y-2">
                <h2 className="text-4xl font-extrabold font-display text-white tracking-tight">Access Secure Foundry</h2>
                <p className="text-zinc-500 max-w-sm mx-auto">Connect your Lace wallet or use a secure recovery seed to manage your privacy-preserving NFTs.</p>
             </div>
             <div className="pt-4 drop-shadow-2xl">
                <WalletConnect />
             </div>
          </div>
                ) : (
          <div className="space-y-16 animate-in fade-in duration-700">
            {/* Header section with Stats or active contract */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 border-b border-zinc-900 pb-16">
               <div className="max-w-2xl space-y-4">
                  <h1 className="text-6xl font-black font-display tracking-tight text-white leading-[0.9] uppercase">
                     ZK Private <br/> <span className="text-indigo-600">Launchpad</span>
                  </h1>
                  <p className="text-zinc-500 font-medium leading-relaxed max-w-sm">Deploy encrypted NFT factories where all supply and ownership remain your private secret.</p>
                  
                  <div className="flex flex-wrap gap-3 pt-6">
                     <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-full">
                        <Box className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-bold text-zinc-300">{collections.length} Factories Active</span>
                     </div>
                     {selectedContract && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-600/10 border border-indigo-600/20 rounded-full">
                          <Zap className="w-4 h-4 text-green-500 fill-green-500" />
                          <span className="text-xs font-bold text-indigo-400">Targeting Registry Mode</span>
                        </div>
                     )}
                  </div>
               </div>

               <aside className="w-full lg:w-[400px]">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                     {selectedContract ? (
                        <div className="animate-in fade-in zoom-in-95 duration-500">
                           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 translate-x-3 -translate-y-3 group-hover:scale-125 transition-all">
                              <ShieldCheck className="w-32 h-32 text-indigo-500" />
                           </div>
                           <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2">ACTIVE CONTEXT ADDRESS</p>
                           <code className="text-xs font-mono text-indigo-400 block break-all mb-6">
                              {selectedContract}
                           </code>
                           <button 
                              onClick={() => setSelectedContract(null)}
                              className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                           >
                              <PlusCircle className="w-4 h-4" />
                              WIPE SELECTION
                           </button>
                        </div>
                     ) : (
                        <div className="text-center py-4 space-y-4">
                           <LayoutGrid className="w-12 h-12 text-zinc-700 mx-auto" />
                           <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest leading-tight">No Active Context<br/><span className="text-[10px] font-medium opacity-50 lowercase">Select a factory below to begin minting</span></p>
                        </div>
                     )}
                  </div>
               </aside>
            </div>

            {/* Launchpad Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
               {/* Collection Manager & Gallery */}
               <div className="lg:col-span-2 space-y-16">
                  {/* Gallery */}
                  <section>
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-2xl font-black font-display text-white tracking-tight uppercase flex items-center gap-2">
                          <LayoutGrid className="w-6 h-6 text-indigo-500" />
                          Registry Gallery
                       </h3>
                       <button 
                          onClick={refreshData}
                          className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all"
                       >
                          <RefreshCw className="w-4 h-4" />
                       </button>
                    </div>
                    <CollectionList 
                      collections={collections} 
                      onSelect={setSelectedContract} 
                      selectedAddress={selectedContract} 
                    />
                  </section>

                  {/* Creator Tools */}
                  {!selectedContract && (
                    <section className="animate-in slide-in-from-bottom-8 duration-700">
                       <LaunchpadForm onCreate={createCollection} isLoading={isLoading} addLog={addLog} />
                    </section>
                  )}

                  {/* Minting & NFT Area (only visible if collection is selected) */}
                  {selectedContract && (
                    <div className="space-y-16 animate-in slide-in-from-bottom-8 fade-in duration-500">
                       <section>
                          <div className="flex items-center justify-between mb-8">
                             <h3 className="text-2xl font-black font-display text-white tracking-tight uppercase flex items-center gap-2">
                                <Box className="w-6 h-6 text-indigo-500" />
                                MINT PROTOCOL
                             </h3>
                          </div>
                          <MintForm onMint={(meta) => mint(selectedContract, meta)} isLoading={isLoading} addLog={addLog} />
                       </section>

                       <section>
                          <div className="flex items-center justify-between mb-8">
                             <h3 className="text-2xl font-black font-display text-white tracking-tight uppercase flex items-center gap-2">
                                <History className="w-6 h-6 text-indigo-500" />
                                COLLECTION STATE (YOURS)
                             </h3>
                          </div>
                          <NFTList 
                            nfts={userNfts.filter(n => n.collectionAddress === selectedContract)} 
                            onVerify={async (id) => addLog(`Verifying Token #${id}... [ZK-PROOF-CLIENT-SIDE]`)} 
                            onTransfer={async (id, rec) => addLog(`Initiating Transfer of Token #${id} to ${rec}...`)} 
                          />
                       </section>
                    </div>
                  )}
               </div>

               {/* Right Sidebar - Logic Monitor */}
               <aside className="space-y-8">
                  <div className="bg-zinc-950 border border-zinc-900 rounded-3xl flex flex-col h-[700px] shadow-2xl relative">
                     <div className="flex items-center gap-3 p-6 border-b border-zinc-900 bg-zinc-900/30 rounded-t-3xl">
                        <Terminal className="w-5 h-5 text-emerald-500" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Midnight Node Monitor</h4>
                     </div>
                     
                     <div className="flex-1 overflow-y-auto p-6 font-mono text-[11px] leading-relaxed space-y-4 custom-scrollbar">
                        {log.length === 0 ? (
                           <div className="opacity-20 italic">
                              <p>System Ready...</p>
                              <p>Waiting for ZK-Witness data...</p>
                           </div>
                        ) : (
                           log.map((entry: string, i: number) => (
                              <div key={i} className="text-zinc-500 border-l border-indigo-600/30 pl-4 py-1">
                                 {entry}
                              </div>
                           ))
                        )}
                     </div>

                     <div className="p-6 border-t border-zinc-900 bg-zinc-950 rounded-b-3xl">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'}`} />
                              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                                 {isLoading ? 'Witness Generation Active' : 'Protocol IDLE'}
                              </span>
                           </div>
                           <ShieldCheck className="w-4 h-4 text-zinc-800" />
                        </div>
                     </div>
                  </div>

                  <div className="p-8 bg-indigo-600/5 border border-indigo-600/10 rounded-3xl">
                     <p className="text-[10px] uppercase font-bold text-indigo-500/50 mb-4 tracking-widest">System Architecture</p>
                     <div className="space-y-4">
                        <div className="flex items-start gap-4">
                           <div className="w-1 h-1 bg-indigo-500 rounded-full mt-1.5" />
                           <p className="text-[11px] text-zinc-500 leading-tight"><span className="text-zinc-300 font-bold">Multi-Contract Pattern:</span> Each collection is a separate on-chain instance.</p>
                        </div>
                        <div className="flex items-start gap-4">
                           <div className="w-1 h-1 bg-indigo-500 rounded-full mt-1.5" />
                           <p className="text-[11px] text-zinc-500 leading-tight"><span className="text-zinc-300 font-bold">Global Registry:</span> Automatic persistence across browser sessions.</p>
                        </div>
                     </div>
                  </div>
               </aside>
            </div>
          </div>
        )
}
      </div>
    </main>
  );
}
