'use client';

import { Collection } from '../hooks/useLaunchpad';
import { Rocket, Box, Database, ExternalLink, Calendar, User, Clock, CheckCircle } from 'lucide-react';

interface CollectionListProps {
  collections: Collection[];
  onSelect: (addr: string) => void;
  selectedAddress: string | null;
}

export default function CollectionList({ collections, onSelect, selectedAddress }: CollectionListProps) {
  if (collections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8 bg-zinc-950/20 border border-dashed border-zinc-800 rounded-3xl text-center backdrop-blur-sm grayscale opacity-30 select-none">
        <Database className="w-16 h-16 text-zinc-600 mb-6 group-hover:rotate-12 transition-transform duration-500" />
        <h3 className="text-xl font-black font-display text-zinc-400 uppercase tracking-widest">No Active Collections</h3>
        <p className="max-w-xs mx-auto mt-2 text-xs font-bold text-zinc-600 leading-tight">Launch your first private NFT factory to see it here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
      {collections.map((col) => (
        <button
          key={col.contractAddress}
          onClick={() => onSelect(col.contractAddress)}
          className={`flex flex-col text-left group relative bg-zinc-900/30 border p-8 rounded-3xl transition-all duration-300 active:scale-[0.98] ${
            selectedAddress === col.contractAddress 
            ? 'border-indigo-600/50 bg-indigo-600/5 shadow-2xl shadow-indigo-600/10' 
            : 'border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/50 hover:shadow-2xl hover:shadow-black/50'
          }`}
        >
          {selectedAddress === col.contractAddress && (
            <div className="absolute top-4 right-4 animate-in zoom-in-50 duration-300">
               <div className="bg-green-500 p-1 rounded-full"><CheckCircle className="w-3 h-3 text-zinc-950" /></div>
            </div>
          )}

          <div className="flex-1 space-y-4">
             <div className="flex items-center gap-3">
                <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl group-hover:scale-110 transition-transform">
                  <Box className="w-5 h-5 text-indigo-400" />
                </div>
                <h4 className="text-xl font-bold font-display text-white truncate max-w-[240px]">{col.name}</h4>
             </div>
             
             <p className="text-xs text-zinc-500 leading-relaxed min-h-[48px] line-clamp-2">
                {col.description}
             </p>

             <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-800/50">
                <div className="flex flex-col">
                   <span className="text-[9px] uppercase font-bold text-zinc-600 tracking-widest">Supply Cap</span>
                   <span className="text-lg font-black text-white font-mono">{col.maxSupply || (col as any).supply || '—'}</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-[9px] uppercase font-bold text-zinc-600 tracking-widest">Creator</span>
                   <span className="text-xs font-mono text-indigo-400 block break-all truncate">
                      {col.creatorAddress ? `${col.creatorAddress.slice(0, 16)}...` : 'System'}
                   </span>
                </div>
             </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
             <span className="text-[10px] font-bold text-zinc-600 flex items-center gap-1.5 uppercase tracking-tighter">
                <Clock className="w-3 h-3 text-zinc-800" />
                Launchpad Node
             </span>
             <code className="text-[10px] bg-zinc-950 px-2 py-1 rounded-md border border-zinc-900 font-mono text-zinc-600 truncate max-w-[120px]">
                {col.contractAddress.slice(0, 12)}...
             </code>
          </div>
        </button>
      ))}
    </div>
  );
}
