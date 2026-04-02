'use client';

import { useState } from 'react';
import { Tag, UserCheck, ShieldCheck, MoreVertical, Copy, ArrowUpRight } from 'lucide-react';
import { OwnedNFT } from '../types/nft';

interface NFTListProps {
  nfts: OwnedNFT[];
  onVerify: (id: string) => Promise<any>;
  onTransfer: (id: string, recipient: string) => Promise<any>;
}

export default function NFTList({ nfts, onVerify, onTransfer }: NFTListProps) {
  const [selectedNFT, setSelectedNFT] = useState<string | null>(null);
  const [recipient, setRecipient] = useState('');
  const [verifying, setVerifying] = useState<Record<string, boolean>>({});

  const handleVerify = async (id: string) => {
    setVerifying(prev => ({ ...prev, [id]: true }));
    try {
      await onVerify(id);
    } finally {
      setVerifying(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleTransfer = async (id: string) => {
    if (!recipient) return;
    try {
      await onTransfer(id, recipient);
      setSelectedNFT(null);
      setRecipient('');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {nfts.length === 0 ? (
        <div className="col-span-full border border-dashed border-zinc-800 rounded-2xl py-20 px-8 text-center bg-zinc-950/20">
          <div className="bg-zinc-900 border border-zinc-800 p-4 w-fit mx-auto rounded-xl mb-4">
            <Tag className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-xl font-bold font-display text-zinc-300">No Private NFTs found</h3>
          <p className="text-zinc-600 mt-2 max-w-sm mx-auto">Your address doesn't seem to have any locally known NFT state. Mint a new one to see it here.</p>
        </div>
      ) : (
        nfts.map((nft) => (
          <div key={nft.tokenId} className="group flex flex-col bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300 hover:border-zinc-700/50">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg group-hover:scale-110 transition-transform">
                  <Tag className="w-5 h-5 text-indigo-400 font-bold" />
                </div>
                <h4 className="text-lg font-bold font-display text-zinc-100">NFT #{nft.tokenId}</h4>
              </div>
              <button 
                onClick={() => handleVerify(nft.tokenId)}
                disabled={verifying[nft.tokenId]}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors group/verify relative"
              >
                {verifying[nft.tokenId] ? (
                   <div className="w-4 h-4 border border-zinc-500 border-t-white rounded-full animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-zinc-500 hover:text-green-500 transition-colors" />
                )}
                <span className="absolute bottom-full right-0 mb-2 whitespace-nowrap bg-zinc-800 text-zinc-100 text-[10px] px-2 py-1 rounded opacity-0 group-verify/hover:opacity-100 transition-opacity">ZK Prove Ownership</span>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">Metadata (Private)</p>
                <div className="bg-zinc-950/80 rounded-lg p-3 border border-zinc-800 text-[11px] font-mono text-zinc-400 break-all overflow-hidden max-h-24">
                  {nft.metadata}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">Commitment Hash (On-Chain)</p>
                <div className="flex items-center gap-2 group/hash">
                  <Hash className="w-3 h-3 text-zinc-600" />
                  <span className="text-[10px] font-mono text-zinc-500 truncate block flex-1">
                    {nft.metadataHash}
                  </span>
                  <button className="opacity-0 group-hover:opacity-100 group-hash/hover:scale-110 transition-all p-1 hover:bg-zinc-800 rounded-md">
                    <Copy className="w-3 h-3 text-zinc-500" />
                  </button>
                </div>
              </div>

              {nft.txId && (
                <div className="pt-2 border-t border-zinc-800/50">
                  <a 
                    href={`https://preprod.midnightexplorer.com/tx/0x${nft.txId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest"
                  >
                    View on Explorer
                    <ArrowUpRight className="w-2.5 h-2.5" />
                  </a>
                </div>
              )}
            </div>

            <div className="mt-auto">
              {selectedNFT === nft.tokenId ? (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <input
                    type="text"
                    placeholder="Recipient mn_addr..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleTransfer(nft.tokenId)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 rounded-lg transition-all"
                    >
                      Process Transfer
                    </button>
                    <button 
                      onClick={() => setSelectedNFT(null)}
                      className="px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-bold py-2 rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setSelectedNFT(nft.tokenId)}
                  className="w-full flex items-center justify-center gap-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 text-xs font-bold py-2.5 rounded-lg transition-all"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Transfer Ownership
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function Hash({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="9" y2="9"></line><line x1="4" x2="20" y1="15" y2="15"></line><line x1="10" x2="8" y1="3" y2="21"></line><line x1="16" x2="14" y1="3" y2="21"></line></svg>
  );
}
