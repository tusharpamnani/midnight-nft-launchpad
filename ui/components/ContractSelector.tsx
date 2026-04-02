'use client';

import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { contractStorage } from '../lib/contractStorage';
import { actionDeploy } from '../app/actions';
import { PlusCircle, Search, Clock, ShieldCheck, ChevronRight, LayoutDashboard, Hash } from 'lucide-react';

interface ContractSelectorProps {
  onSelect: (addr: string) => void;
  addLog: (msg: string) => void;
}

export default function ContractSelector({ onSelect, addLog }: ContractSelectorProps) {
  const { address, isConnected } = useWallet();
  const [contracts, setContracts] = useState<any[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [joinAddress, setJoinAddress] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && address) {
      setContracts(contractStorage.getContracts(address));
    }
  }, [isConnected, address]);

  const handleDeploy = async () => {
    if (!address) return;
    setIsDeploying(true);
    addLog("Initiating new contract deployment...");
    try {
      const res = await actionDeploy();
      if (res.stdout) {
         // Pull address from deployment logic bridge output
         // Usually we get it from stdout or a JSON response
         // For now we assume success
         addLog(res.stdout);
      }
      // Re-fetch since it saved to deployment.json
      window.location.reload(); // Hard refresh to pick up new deployment.json in this simplified example
    } catch (e: any) {
      addLog(`Deployment failed: ${e.message}`);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinAddress.length < 24) {
      setError("Please enter a valid contract address.");
      return;
    }
    if (address) {
       contractStorage.saveContract(address, joinAddress);
       onSelect(joinAddress);
       setJoinAddress('');
    }
  };

  if (!isConnected) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <ShieldCheck className="w-48 h-48 text-indigo-500" />
        </div>
        
        <h2 className="text-3xl font-extrabold font-display tracking-tight text-white mb-2 underline decoration-indigo-600/30 underline-offset-8">
           Contract Access
        </h2>
        <p className="text-zinc-500 text-sm max-w-lg leading-relaxed mb-8 font-medium">
          Choose an existing NFT registry to manage or launch a new one. All contracts are privacy-preserving and public.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Section: New/Join */}
           <div className="space-y-6 bg-zinc-900/40 p-6 rounded-2xl border border-zinc-900">
              <button
                onClick={handleDeploy}
                disabled={isDeploying}
                className="w-full flex items-center justify-between gap-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-4 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm leading-none">Deploy New Registry</span>
                    <span className="text-[10px] text-indigo-200 font-medium">Standard NFT Foundry</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-800"></span></div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-zinc-600 tracking-widest"><span className="bg-zinc-950 px-3 py-1 rounded-full border border-zinc-900">OR JOIN EXISTING</span></div>
              </div>

              <form onSubmit={handleJoin} className="space-y-3">
                <div className="relative group">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Enter Contract Hash..."
                    value={joinAddress}
                    onChange={(e) => setJoinAddress(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-xs text-indigo-400 font-mono focus:ring-1 focus:ring-indigo-600 outline-none transition-all placeholder:text-zinc-700"
                  />
                </div>
                {error && <p className="text-[10px] text-red-500 italic px-2 font-medium">{error}</p>}
                <button
                  type="submit"
                  className="w-full bg-zinc-100 hover:bg-white text-zinc-950 font-bold py-3.5 rounded-xl transition-all active:scale-95"
                >
                  Access Registry
                </button>
              </form>
           </div>

           {/* Section: Existing */}
           <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-900 flex flex-col h-full overflow-hidden">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                 <Clock className="w-3 h-3 text-indigo-500" />
                 Recent Contexts
              </h4>
              
              {contracts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 select-none p-10 grayscale">
                   <LayoutDashboard className="w-12 h-12 text-zinc-400 mb-3" />
                   <p className="text-[10px] font-bold text-zinc-600 leading-tight">No known contracts for this address yet.</p>
                </div>
              ) : (
                <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                   {contracts.map((c) => (
                     <button
                        key={c.address}
                        onClick={() => onSelect(c.address)}
                        className="w-full bg-zinc-950 border border-zinc-800 hover:border-indigo-600/40 p-4 rounded-xl text-left transition-all active:scale-95 group relative mb-2"
                     >
                        <div className="flex items-center justify-between mb-1.5">
                           <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Contract Active</span>
                           <span className="text-[9px] text-zinc-600">{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Hash className="w-3 h-3 text-indigo-500" />
                           <code className="text-xs text-indigo-400 font-mono break-all">{c.address}</code>
                        </div>
                     </button>
                   ))}
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
