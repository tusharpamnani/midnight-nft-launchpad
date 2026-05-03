'use client';

import { useState } from 'react';
import { Rocket, Hash, Info } from 'lucide-react';

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
      addLog(`Collection "${name}" deployed.`);
      setName('');
      setDesc('');
    } catch (e: any) {
      addLog(`Deploy failed: ${e.message}`);
    }
  };

  return (
    <div className="p-10 relative" style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
      {/* Blue top-border accent */}
      <div className="absolute top-0 left-0 right-0 h-px scale-x-0 hover:scale-x-100 transition-transform duration-500 origin-left" style={{ background: '#0000FE' }} />

      <form onSubmit={handleSubmit} className="space-y-10">

        {/* Name */}
        <div className="space-y-3">
          <label className="text-[11px] tracking-[0.3em] font-martian uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Collection Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Midnight Genesis"
            className="w-full px-5 py-4 text-base font-martian text-white placeholder:text-zinc-800 focus:outline-none transition-all"
            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,254,0.3)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
          />
        </div>

        {/* Supply */}
        <div className="grid grid-cols-[1fr_auto] gap-6 items-end">
          <div className="space-y-3">
            <label className="text-[11px] tracking-[0.3em] font-martian uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Max Supply</label>
            <div className="relative">
              <Hash className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.15)' }} />
              <input
                type="number"
                required
                min={1}
                value={supply}
                onChange={(e) => setSupply(parseInt(e.target.value))}
                className="w-full pl-12 pr-5 py-4 text-base font-martian text-white focus:outline-none transition-all"
                style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,254,0.3)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 px-5 py-4 h-[54px]" style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
            <Info className="w-4 h-4 shrink-0" style={{ color: 'rgba(0,0,254,0.3)' }} />
            <span className="text-[10px] font-martian" style={{ color: 'rgba(255,255,255,0.2)' }}>Immutable post-deploy</span>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <label className="text-[11px] tracking-[0.3em] font-martian uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Description (On-chain)</label>
          <textarea
            required
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="A private world of rare artifacts..."
            className="w-full px-5 py-4 text-base font-martian text-zinc-400 placeholder:text-zinc-800 focus:outline-none transition-all resize-none min-h-[120px]"
            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,254,0.3)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
            spellCheck="false"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="relative overflow-hidden group w-full flex items-center justify-center gap-3 text-white font-martian text-[11px] tracking-[0.2em] uppercase py-5 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
          style={{ background: '#0000FE' }}
        >
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent)' }} />
          {isLoading ? (
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
              Generating ZK Proof...
            </div>
          ) : (
            <div className="relative z-10 flex items-center gap-3">
              <Rocket className="w-4 h-4" />
              Deploy Factory
            </div>
          )}
        </button>
      </form>
    </div>
  );
}