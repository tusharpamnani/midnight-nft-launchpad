'use client';

import { useWallet } from '../hooks/useWallet';
import { Wallet, LogOut, CheckCircle2 } from 'lucide-react';

export default function WalletConnect() {
  const { address, isConnected, connect, disconnect, isClient } = useWallet();

  if (!isClient) return null;

  return (
    <div className="flex items-center gap-4">
      {isConnected ? (
        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm font-mono text-zinc-400">
              {address?.slice(0, 10)}...{address?.slice(-8)}
            </span>
          </div>
          <button 
            onClick={disconnect}
            className="p-1 hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 hover:text-zinc-300"
            title="Disconnect"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={connect}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg transition-all font-medium shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <Wallet className="w-5 h-5" />
          Connect Lace Wallet
        </button>
      )}
    </div>
  );
}
