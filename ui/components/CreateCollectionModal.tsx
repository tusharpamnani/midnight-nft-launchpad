'use client';

import { useState } from 'react';
import { PlusCircle, X } from 'lucide-react';

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string, maxSupply: number) => void;
  isLoading: boolean;
}

export default function CreateCollectionModal({ isOpen, onClose, onCreate, isLoading }: CreateCollectionModalProps) {
  const [name, setName] = useState('My NFT Collection');
  const [description, setDescription] = useState('A private NFT collection on Midnight');
  const [maxSupply, setMaxSupply] = useState('100');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const supply = parseInt(maxSupply) || 100;
    onCreate(name, description, supply);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(8,8,16,0.95)' }}>
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: '#0000FE' }} />
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center" style={{ border: '1px solid rgba(0,0,254,0.3)' }}>
              <PlusCircle className="w-4 h-4" style={{ color: '#0000FE' }} />
            </div>
            <h2 className="text-lg font-syne font-bold text-white">Create Collection</h2>
          </div>
          <button onClick={onClose} className="hover:opacity-60 transition-opacity">
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-[9px] tracking-[0.25em] font-martian uppercase text-zinc-600">Collection Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/40 border border-white/[0.06] px-4 py-3 text-sm font-mono text-zinc-200 focus:outline-none focus:border-violet-500/30 transition-all"
              placeholder="My NFT Collection"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[9px] tracking-[0.25em] font-martian uppercase text-zinc-600">Description</label>
              <span className="text-[9px] font-martian text-zinc-600 uppercase tracking-widest">Private</span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-black/40 border border-white/[0.06] px-4 py-3 text-[11px] font-mono text-zinc-500 focus:outline-none focus:border-violet-500/30 transition-all resize-none min-h-[80px]"
              placeholder="A private NFT collection on Midnight"
              spellCheck="false"
            />
          </div>

          {/* Max Supply */}
          <div className="space-y-2">
            <label className="text-[9px] tracking-[0.25em] font-martian uppercase text-zinc-600">Max Supply (0 = unlimited)</label>
            <input
              type="number"
              value={maxSupply}
              onChange={(e) => setMaxSupply(e.target.value)}
              className="w-full bg-black/40 border border-white/[0.06] px-4 py-3 text-sm font-mono text-zinc-200 focus:outline-none focus:border-violet-500/30 transition-all"
              min="0"
              required
            />
            <p className="text-[10px] text-zinc-600 font-martian">Circuit-enforced cap. Immutable scarcity.</p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !name}
            className="w-full flex items-center justify-center gap-3 border border-violet-500/30 bg-violet-500/[0.06] hover:bg-violet-500/[0.12] disabled:opacity-40 disabled:cursor-not-allowed text-violet-300 font-mono text-[11px] tracking-[0.2em] uppercase py-4 transition-all active:scale-[0.99]"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
                Deploying Contract...
              </>
            ) : (
              <>
                <PlusCircle className="w-3.5 h-3.5" />
                Create Collection
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
