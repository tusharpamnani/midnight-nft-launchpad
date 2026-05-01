'use client';

import { CollectionInfo } from '../types/nft';
import { AlertCircle } from 'lucide-react';

interface CollectionListProps {
  collections: CollectionInfo[];
  onSelect: (address: string) => void;
  selectedAddress: string | null;
}

export default function CollectionList({ collections, onSelect, selectedAddress }: CollectionListProps) {
  if (collections.length === 0) {
    return (
      <div className="py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <p className="text-[10px] font-martian tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.15)' }}>No factories deployed</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto" style={{ maxHeight: '180px' }}>
      {collections.map((col, idx) => {
        const isSelected = selectedAddress === col.address;
        const isUnnamed = !col.name || col.name.trim() === '' || col.name === 'Unnamed Collection';

        return (
          <button
            key={col.address}
            onClick={() => onSelect(col.address)}
            className="group w-full text-left transition-all duration-200"
            style={{
              background: isSelected ? 'rgba(0,0,254,0.04)' : 'transparent',
              borderBottom: idx < collections.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'
            }}
            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
            onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ opacity: isUnnamed ? 0.4 : 1 }}>
              {/* Name */}
              <div className="w-[35%] min-w-0">
                <h4 className="text-sm font-syne font-bold text-white truncate">
                  {isUnnamed ? '---' : col.name}
                </h4>
              </div>

              {/* Supply Cap */}
              <div className="w-[20%] text-center">
                <span className="text-xl font-dm-serif text-white">{col.maxSupply || (col as any).supply || '∞'}</span>
              </div>

              {/* Contract Address */}
              <div className="w-[35%] min-w-0 text-right">
                <code className="text-[9px] font-martian block truncate" style={{ color: 'rgba(255,255,255,0.15)' }}>
                  {col.address.slice(0, 20)}...
                </code>
              </div>

              {/* Status */}
              <div className="w-[10%] text-right shrink-0">
                {isUnnamed && (
                  <span className="text-[8px] font-martian uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.15)' }}>Unverified</span>
                )}
                {isSelected && (
                  <div className="w-2 h-2 rounded-full inline-block" style={{ background: '#0000FE' }} />
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}