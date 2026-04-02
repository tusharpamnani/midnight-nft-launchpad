'use client';

import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { Wallet, Shield, Hash, LogOut, CheckCircle, Smartphone } from 'lucide-react';

export default function WalletConnect() {
  const { isConnected, isConnecting, address, walletType, connectLace, connectSeed, disconnect, isClient } = useWallet();
  const [showSeedInput, setShowSeedInput] = useState(false);
  const [seed, setSeed] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isClient) return null;

  const handleLace = async () => {
    setError(null);
    try {
      await connectLace();
    } catch (e: any) {
      setError("Lace wallet not found or connection rejected.");
      setShowSeedInput(true); // Automatically suggest seed fallback
    }
  };

  const handleSeedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (seed.length < 32) {
      setError("Please enter a valid 64-character hex seed.");
      return;
    }
    await connectSeed(seed);
    setShowSeedInput(false);
    setSeed('');
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-2 pr-4 shadow-xl">
        <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center">
          {walletType === 'lace' ? <Smartphone className="w-5 h-5 text-indigo-400" /> : <Shield className="w-5 h-5 text-indigo-400" />}
        </div>
        <div className="flex flex-col min-w-[120px]">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">
            {walletType === 'lace' ? 'Lace Connected' : 'Seed Connected'}
          </span>
          <span className="text-xs font-mono text-zinc-100 truncate max-w-[140px]">{address}</span>
        </div>
        <button 
          onClick={disconnect}
          className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-red-400 transition-all"
          title="Disconnect Wallet"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {!showSeedInput ? (
        <div className="flex gap-3">
          <button
            onClick={handleLace}
            disabled={isConnecting}
            className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
          >
            {isConnecting ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Smartphone className="w-5 h-5" />
            )}
            Connect Lace
          </button>
          <button
            onClick={() => setShowSeedInput(true)}
            className="flex items-center gap-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-800 font-bold py-3 px-6 rounded-2xl transition-all active:scale-95"
          >
            <Shield className="w-5 h-5 text-zinc-400" />
            Use Seed
          </button>
        </div>
      ) : (
        <form onSubmit={handleSeedSubmit} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400" />
                Seed-Based Recovery
              </h3>
              <button onClick={() => setShowSeedInput(false)} className="text-xs text-zinc-500 hover:text-zinc-300">Cancel</button>
           </div>
           
           <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5 tracking-widest">Wallet Seed (Hex)</label>
                <input
                  type="password"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  placeholder="57bb166cb6b..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-indigo-400 font-mono focus:ring-1 focus:ring-indigo-600 outline-none"
                  autoFocus
                />
              </div>
              
              {error && <p className="text-[10px] text-red-500 font-medium italic">{error}</p>}
              
              <button
                type="submit"
                className="w-full bg-zinc-100 hover:bg-white text-zinc-950 font-bold py-3 rounded-xl transition-all active:scale-95 shadow-lg"
              >
                Connect Fallback
              </button>
              
              <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                ⚠️ Secure Warning: This seed remains in transient memory and is NOT stored in browser storage.
              </p>
           </div>
        </form>
      )}
    </div>
  );
}
