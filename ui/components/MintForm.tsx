'use client';

import { useState } from 'react';
import { Send, Hash, FileText } from 'lucide-react';

interface MintFormProps {
  onMint: (metadata: string) => Promise<any>;
  isLoading: boolean;
  addLog: (msg: string) => void;
}

export default function MintForm({ onMint, isLoading, addLog }: MintFormProps) {
  const [metadata, setMetadata] = useState('{\n  "name": "Midnight Artifact",\n  "description": "Minted via UI with ZK-privacy",\n  "power": 100\n}');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      addLog("Starting mint process...");
      const JSONMetadata = JSON.parse(metadata);
      addLog(`Metadata validated: ${JSONMetadata.name}`);
      const res = await onMint(metadata);
      addLog(`Minting success! Token ID: ${res.tokenId}`);
    } catch (e: any) {
      addLog(`Minting error: ${e.message}`);
    }
  };

  return (
    <div className="bg-zinc-950/40 border border-zinc-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
          <FileText className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold font-display text-zinc-100">Mint Privacy NFT</h3>
          <p className="text-zinc-500 text-sm">Enter metadata to store privately</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Metadata (JSON format)</label>
          <textarea
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 font-mono text-xs text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent min-h-[160px] resize-none"
            spellCheck="false"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-600/30 text-white font-semibold py-3.5 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/10"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
          {isLoading ? "Generating ZK Proof..." : "Create New NFT"}
        </button>
      </form>
    </div>
  );
}
