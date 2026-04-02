'use client';

import { useState } from 'react';
import { Collection } from '../hooks/useLaunchpad';
import { Rocket, Info, Hash, User, Calendar, ExternalLink, Zap } from 'lucide-react';

interface CollectionFormProps {
  onCreate: (name: string, desc: string, supply: number) => Promise<any>;
  isLoading: boolean;
  addLog: (msg: string) => void;
}

export default function LaunchpadForm({ onCreate, isLoading, addLog }: CollectionFormProps) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [supply, setSupply] = useState(100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !desc || supply <= 0) return;
    
    addLog(`Creating collection: ${name}...`);
    try {
      await onCreate(name, desc, supply);
      addLog(`Collection ${name} launched!`);
      setName('');
      setDesc('');
    } catch (e: any) {
      addLog(`Creation failed: ${e.message}`);
    }
  };

  return (
    <div className="bg-zinc-950/40 border border-zinc-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-700">
        <Rocket className="w-48 h-48 text-indigo-500" />
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
          <Rocket className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-2xl font-black font-display text-white tracking-tight uppercase">Launch Collection</h3>
          <p className="text-zinc-500 text-sm font-medium">Deploy a new privacy-controlled NFT registry</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2 px-1">Collection Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Midnight Genesis"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all font-medium placeholder:text-zinc-700"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-1">
             <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2 px-1">Max Supply Cap</label>
             <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="number"
                  required
                  value={supply}
                  onChange={(e) => setSupply(parseInt(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-5 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all font-mono"
                />
             </div>
          </div>
          <div className="flex items-center p-4 bg-zinc-900/30 border border-zinc-900 rounded-2xl">
             <Info className="w-5 h-5 text-indigo-500/50 mr-3 flex-shrink-0" />
             <p className="text-[11px] text-zinc-500 leading-tight">Supply caps are enforced by ZK constraints and cannot be changed after launch.</p>
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2 px-1">Global Description (On-Chain)</label>
          <textarea
            required
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="A private world of rare artifacts..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-600 min-h-[100px] resize-none placeholder:text-zinc-700"
            spellCheck="false"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-200 text-zinc-950 font-black py-4 px-8 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl active:scale-95 group/btn uppercase tracking-widest text-sm"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-zinc-950/20 border-t-zinc-950 rounded-full animate-spin" />
          ) : (
            <Zap className="w-5 h-5 text-indigo-600 group-hover:fill-indigo-600 transition-colors" />
          )}
          {isLoading ? "Generating Multi-ZK Proof..." : "Launch Factory"}
        </button>
      </form>
    </div>
  );
}
