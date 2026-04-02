'use client';

import { useState } from 'react';
import { Send, Hash, FileText } from 'lucide-react';

interface MintFormProps {
  onMint: (metadata: string) => Promise<any>;
  isLoading: boolean;
  addLog: (msg: string) => void;
}

export default function MintForm({ onMint, isLoading, addLog }: MintFormProps) {
  const [name, setName] = useState('Midnight Artifact');
  const [description, setDescription] = useState('Minted via UI with ZK-privacy');
  const [imageUrl, setImageUrl] = useState('/nft-sample.png');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      addLog("Starting mint process...");
      const metadata = JSON.stringify({
        name,
        description,
        image: imageUrl,
        mintedAt: new Date().toISOString()
      });
      addLog(`Metadata validated: ${name}`);
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1.5">Asset Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all font-medium"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1.5">Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-300 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all"
            />
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl overflow-hidden h-[45px] flex items-center justify-center">
            {imageUrl && <img src={imageUrl} alt="preview" className="h-full w-full object-cover opacity-50" />}
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1.5">Description (Private)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-600 min-h-[80px] resize-none"
            spellCheck="false"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-600/30 text-white font-semibold py-3.5 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/10 active:scale-95"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          )}
          {isLoading ? "Generating ZK Proof..." : "Mint Private NFT"}
        </button>
      </form>
    </div>
  );
}
