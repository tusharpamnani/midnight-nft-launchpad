'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '../hooks/useWallet';
import { useContract } from '../hooks/useContract';
import { useLaunchpad } from '../hooks/useLaunchpad';
import WalletConnect from '../components/WalletConnect';
import LaunchpadForm from '../components/LaunchpadForm';
import CollectionList from '../components/CollectionList';
import MintForm from '../components/MintForm';
import NFTList from '../components/NFTList';
import { PlusCircle, Box, ArrowUpRight } from 'lucide-react';
import CreateCollectionModal from '../components/CreateCollectionModal';

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const router = useRouter();
  const { isConnected, address, session, walletType, isConnecting, walletStatus } = useWallet();
  const { deployment, deploy, log, addLog, isDeploying, refreshDeployment } = useContract();
  const [selectedContract, setSelectedContract] = useState<string | null>(null);
  const { collections, userNfts, createCollection, mint, transfer, verify, isLoading, refreshData } = useLaunchpad();

  const handleMint = async (metadata: string) => {
    if (session && selectedContract) {
      return await mint(session, selectedContract, metadata);
    }
  };

  const handleVerify = async (nftId: string) => {
    if (session) {
      return await verify(session, nftId);
    }
  };

  const handleTransfer = async (nftId: string, recipient: string) => {
    if (session) {
      return await transfer(session, nftId, recipient);
    }
  };

  // Effects must be called unconditionally
  useEffect(() => {
    if (isConnected && walletStatus !== 'checking') {
      refreshDeployment();
    }
  }, [isConnected, walletStatus, refreshDeployment]);

  useEffect(() => {
    if (selectedContract && deployment?.contractAddress && selectedContract === deployment.contractAddress) {
      setSelectedContract(null);
    }
  }, [selectedContract, deployment]);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isConnected && walletStatus === 'detected') {
      router.push('/dashboard');
    }
  }, [isConnected, walletStatus, router]);

  // Show landing page while not connected
  if (!isConnected) {
    return (
      <main className="min-h-screen bg-[#080808] text-zinc-100 font-sans relative overflow-x-hidden selection:bg-violet-500/20">
        {/* Scanline overlay */}
        <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.025]" 
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 4px)', backgroundSize: '100% 4px' }} />
        
        {/* Ambient glow */}
        <div className="fixed top-[-20%] left-[30%] w-[700px] h-[500px] rounded-full pointer-events-none -z-10"
          style={{ background: 'radial-gradient(ellipse, rgba(109,40,217,0.07) 0%, transparent 70%)' }} />
        <div className="fixed bottom-[-10%] right-[10%] w-[500px] h-[400px] rounded-full pointer-events-none -z-10"
          style={{ background: 'radial-gradient(ellipse, rgba(109,40,217,0.04) 0%, transparent 70%)' }} />
        
        {/* Fine grid */}
        <div className="fixed inset-0 pointer-events-none -z-10 opacity-40"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        
        {/* ── NAVBAR ── */}
        <nav className="border-b sticky top-0 z-40" style={{ borderColor: 'rgba(255,255,255,0.04)', background: 'rgba(8,8,16,0.8)', backdropFilter: 'blur(20px)' }}>
          <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-5">
              {/* Animated logo mark */}
              <div className="relative w-10 h-10 flex items-center justify-center animate-rotate">
                <div className="absolute inset-0 border rotate-45" style={{ borderColor: 'rgba(0,0,254,0.2)' }} />
                <div className="absolute inset-[3px] rotate-45 animate-counter-rotate" style={{ background: 'rgba(0,0,254,0.08)' }}>
                  <div className="absolute inset-[3px] rotate-45" style={{ border: '1px solid rgba(0,0,254,0.3)' }} />
                </div>
                <svg viewBox="0 0 16 16" className="w-4 h-4 relative z-10 -rotate-45" fill="#0000FE" aria-hidden>
                  <path d="M8 1 L15 5 L15 11 L8 15 L1 11 L1 5 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="8" cy="8" r="2" fill="currentColor" />
                </svg>
              </div>
              <div>
                <span className="text-[13px] font-syne font-bold tracking-[0.15em] text-white uppercase">Midnight</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] tracking-[0.25em] uppercase text-zinc-600 font-martian">Preprod Network</span>
                </div>
              </div>
            </div>
          
            <div className="flex items-center gap-6">
              {isConnected && (
                <div className="flex items-center gap-2 px-4 py-2" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] tracking-[0.2em] uppercase font-martian" style={{ color: 'rgba(255,255,255,0.4)' }}>Connected</span>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* ── HERO SECTION ── */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-8 py-20">
          {/* Logo: nested rotating diamond rings with counter-rotating eye */}
          <div className="mb-16 relative">
            <div className="w-32 h-32 animate-rotate" style={{ border: '1px solid rgba(0,0,254,0.15)' }}>
              <div className="absolute inset-[8px] animate-counter-rotate" style={{ border: '1px solid rgba(0,0,254,0.25)' }}>
                <div className="absolute inset-[8px] animate-rotate" style={{ border: '1px solid rgba(0,0,254,0.35)' }}>
                  <div className="absolute inset-[6px] flex items-center justify-center animate-counter-rotate">
                    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="#0000FE" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="3" fill="#0000FE" />
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" strokeDasharray="2 2" />
                      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Eyebrow label with flanking lines */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-px" style={{ background: 'rgba(0,0,254,0.3)' }} />
            <span className="text-[9px] tracking-[0.35em] font-martian uppercase" style={{ color: '#0000FE' }}>Powered by Midnight Network</span>
            <div className="w-12 h-px" style={{ background: 'rgba(0,0,254,0.3)' }} />
          </div>

          {/* Hero Headline: DM Serif Display + italic outline */}
          <div className="text-center space-y-4 max-w-5xl relative">
            <h1 className="text-[80px] md:text-[100px] font-dm-serif font-normal tracking-[-0.02em] text-white leading-[0.9]">
              Private
            </h1>
            <h1 className="text-[80px] md:text-[100px] font-dm-serif italic font-normal tracking-[-0.02em] leading-[0.9]" style={{ WebkitTextStroke: '1px rgba(0,0,254,0.5)', color: 'transparent' }}>
              NFT Launchpad
            </h1>

            {/* Stat strip with hairline dividers */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8">
              {[
                { value: '4th', label: 'Gen Blockchain' },
                { value: 'ZK', label: 'Shielded by Default' },
                { value: '0', label: 'Data Leaked' }
              ].map(({ value, label }, i) => (
                <div key={label} className="flex items-center gap-8">
                  {i > 0 && <div className="w-px h-12" style={{ background: 'rgba(255,255,255,0.08)' }} />}
                  <div className="text-center">
                    <div className="text-[32px] font-dm-serif text-white leading-none">{value}</div>
                    <div className="text-[9px] tracking-[0.3em] font-martian text-zinc-600 mt-1">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-sm text-zinc-500 max-w-xl mx-auto leading-relaxed text-center mt-10">
            Mint, manage, and trade NFTs with programmable privacy.
            <br />Built on Midnight — the fourth-generation blockchain.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4 pt-10 pb-20">
            <div className="relative overflow-hidden group">
              <WalletConnect />
              {/* Shimmer sweep */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
          </div>

          {/* Animated Ticker Bar */}
          <div className="absolute bottom-20 left-0 right-0 overflow-hidden border-y py-3" style={{ borderColor: 'rgba(0,0,254,0.1)' }}>
            <div className="flex gap-12 animate-ticker whitespace-nowrap">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-12">
                  {['ZK-Shielded Minting', 'On-Chain Proofs', 'Selective Disclosure', 'Compact Circuits', 'Programmable Privacy'].map((text) => (
                    <span key={text} className="text-[10px] tracking-[0.3em] font-martian uppercase" style={{ color: 'rgba(0,0,254,0.6)' }}>
                      {text}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 right-8 flex flex-col items-center gap-2">
            <span className="text-[8px] tracking-[0.3em] font-martian uppercase text-zinc-700 rotate-90 translate-y-8">Scroll</span>
            <div className="w-px h-12 bg-zinc-800 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-4 bg-[#0000FE]/40 animate-scroll-line" />
            </div>
          </div>
        </section>

        {/* ── FEATURES: flush grid with 1px line separators ── */}
        <section className="relative border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="max-w-7xl mx-auto px-8 py-32 relative">
            {/* Section header with ghost number */}
            <div className="mb-20 relative">
              <span className="text-[9px] tracking-[0.3em] font-martian uppercase" style={{ color: '#0000FE' }}>01 / Core Features</span>
              <h2 className="text-[48px] font-dm-serif text-white mt-2">Programmable Privacy</h2>
              <div className="absolute right-0 top-0 text-[180px] font-dm-serif leading-none" style={{ color: 'rgba(255,255,255,0.08)' }}>01</div>
            </div>

            {/* Flush grid - no card borders, just 1px line separators */}
            <div className="grid grid-cols-1 md:grid-cols-3">
              {[
                {
                  title: 'ZK-Shielded Minting',
                  desc: 'Your NFT ownership and metadata remain private. Only you control what to disclose and when.',
                  stat: '100%'
                },
                {
                  title: 'On-Chain Proofs',
                  desc: 'Verify ownership without revealing identity. Zero-knowledge proofs protect your privacy.',
                  stat: '256 bytes'
                },
                {
                  title: 'Programmable Privacy',
                  desc: 'Set supply caps and rules directly in ZK circuits. Immutable on-chain logic.',
                  stat: '0 leaks'
                }
              ].map(({ title, desc, stat }, i) => (
                <div key={title} className="relative p-8 group" style={{ borderRight: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  {/* Blue scaleX top-border reveal on hover */}
                  <div className="absolute top-0 left-0 right-0 h-px scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" style={{ background: '#0000FE' }} />
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <span className="text-[48px] font-dm-serif text-white/20 leading-none">{stat}</span>
                      <div className="w-8 h-8 flex items-center justify-center" style={{ border: '1px solid rgba(0,0,254,0.2)' }}>
                        {i === 0 && <div className="w-3 h-3" style={{ background: '#0000FE' }} />}
                        {i === 1 && <div className="w-3 h-3 rotate-45" style={{ background: '#0000FE' }} />}
                        {i === 2 && <div className="w-3 h-3 rounded-full" style={{ background: '#0000FE' }} />}
                      </div>
                    </div>
                    <h3 className="text-lg font-syne font-bold text-white">{title}</h3>
                    <p className="text-[12px] text-zinc-500 leading-relaxed font-martian">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── STEPS: numbered circles with connecting hairline ── */}
        <section className="relative border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="max-w-7xl mx-auto px-8 py-32 relative">
            {/* Section header */}
            <div className="mb-20 relative">
              <span className="text-[9px] tracking-[0.3em] font-martian uppercase" style={{ color: '#0000FE' }}>02 / Process</span>
              <h2 className="text-[48px] font-dm-serif text-white mt-2">How It Works</h2>
              <div className="absolute right-0 top-0 text-[180px] font-dm-serif leading-none" style={{ color: 'rgba(255,255,255,0.08)' }}>02</div>
            </div>

            {/* Steps with connecting line */}
            <div className="relative">
              {/* Horizontal connecting hairline */}
              <div className="hidden md:block absolute top-6 left-[60px] right-[60px] h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                  { num: '01', title: 'Connect', desc: 'Link your Lace wallet or use a recovery seed to authenticate privately.' },
                  { num: '02', title: 'Deploy', desc: 'Deploy a base contract factory with ZK proof generation.' },
                  { num: '03', title: 'Create', desc: 'Launch NFT collections with customizable supply caps and metadata.' },
                  { num: '04', title: 'Mint & Trade', desc: 'Mint NFTs with shielded ownership. Transfer with ZK verification.' }
                ].map(({ num, title, desc }) => (
                  <div key={num} className="relative pl-6" style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
                    {/* Numbered circle */}
                    <div className="absolute -left-[18px] top-0 w-9 h-9 rounded-full flex items-center justify-center" style={{ border: '1px solid rgba(0,0,254,0.3)', background: '#080810' }}>
                      <span className="text-[10px] font-dm-serif text-[#0000FE]">{num}</span>
                    </div>
                    <div className="space-y-3 pt-2">
                      <h3 className="text-base font-syne font-bold text-white">{title}</h3>
                      <p className="text-[11px] text-zinc-500 leading-relaxed font-martian">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── ZK PROOF TERMINAL ── */}
        <section className="relative border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="max-w-7xl mx-auto px-8 py-32 relative">
            {/* Section header */}
            <div className="mb-20 relative">
              <span className="text-[9px] tracking-[0.3em] font-martian uppercase" style={{ color: '#0000FE' }}>03 / Live Terminal</span>
              <h2 className="text-[48px] font-dm-serif text-white mt-2">ZK Proof Output</h2>
              <div className="absolute right-0 top-0 text-[180px] font-dm-serif leading-none" style={{ color: 'rgba(255,255,255,0.08)' }}>03</div>
            </div>

            {/* Terminal Block */}
            <div className="relative overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.04)' }}>
              {/* Animated scanning top-border gradient */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0000FE] to-transparent animate-scan" />

              {/* Terminal header */}
              <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="w-2 h-2 rounded-full bg-red-500/60" />
                <div className="w-2 h-2 rounded-full bg-amber-500/60" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
                <span className="ml-4 text-[9px] tracking-[0.3em] font-martian uppercase text-zinc-600">Midnight ZK Terminal</span>
                <div className="ml-auto flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-martian text-zinc-700">LIVE</span>
                </div>
              </div>

              {/* Proof output lines */}
              <div className="p-6 font-martian text-[11px] space-y-3">
                {[
                  '> Initializing Compact runtime...',
                  '> Loading circuit constraints (nft_collection.wasm)...',
                  '> Generating ZK witness for mint_transaction...',
                  '> Proving system: Groth16 (Trusted Setup Complete)',
                  '> Proof generated: 0x7f3a...9c2e (256 bytes)',
                  '> Broadcasting to Midnight Preprod Network...',
                  '> Transaction confirmed in block #1,204,892',
                ].map((line, i) => (
                  <div key={i} className="flex gap-3" style={{ opacity: i < 3 ? 1 : i < 5 ? 0.6 : 0.3 }}>
                    <span className="text-[#0000FE] shrink-0 select-none">{'>'}</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>{line}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER STRIP ── */}
        <footer className="border-t pt-8 flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-8 text-[9px] font-martian tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>
            <span>Multi-Contract</span>
            <span className="w-px h-3" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span>Global Registry</span>
            <span className="w-px h-3" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span>ZK Constraints</span>
          </div>
          <span className="text-[9px] tracking-[0.2em] text-zinc-700 font-martian">© 2026 Midnight NFT Launchpad</span>
        </footer>
      </main>
    );
  }
}
