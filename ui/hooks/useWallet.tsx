'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const DETECT_TIMEOUT_MS = 6000;
const DETECT_INTERVAL_MS = 300;

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  walletType: '1am' | 'lace' | null;
  isConnecting: boolean;
  walletStatus: 'checking' | 'detected' | 'not-found';
  session: any;
  connect: (network?: string) => Promise<any>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [walletType, setWalletType] = useState<'1am' | 'lace' | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletStatus, setWalletStatus] = useState<'checking' | 'detected' | 'not-found'>('checking');
  const [session, setSession] = useState<any>(null);
  
  const connectingRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (connectingRef.current) return;
    
    let mounted = true;
    const startedAt = Date.now();

    const checkWallet = () => {
      if (!mounted) return true;
      
      const wallet1AM = (window as any).midnight?.['1am'];
      const walletLace = (window as any).midnight?.mnLace;

      if (wallet1AM || walletLace) {
        const type = wallet1AM ? '1am' as const : 'lace' as const;
        
        if (mounted) {
          setWalletType(type);
          setWalletStatus('detected');
        }
        
        return true;
      }

      if (Date.now() - startedAt >= DETECT_TIMEOUT_MS) {
        if (mounted) setWalletStatus('not-found');
        return true;
      }

      return false;
    };

    if (checkWallet()) return () => { mounted = false; };

    const intervalId = setInterval(() => {
      if (checkWallet()) clearInterval(intervalId);
    }, DETECT_INTERVAL_MS);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const connect = useCallback(async (network: string = 'preprod') => {
    if (connectingRef.current) {
      console.log('Already connecting, ignoring duplicate call');
      return;
    }
    
    connectingRef.current = true;
    setIsConnecting(true);
    
    try {
      let wallet = (window as any).midnight?.['1am'];
      let type: '1am' | 'lace' = '1am';

      if (!wallet) {
        wallet = (window as any).midnight?.mnLace;
        type = 'lace';
      }

      if (!wallet) {
        throw new Error('No Midnight wallet detected. Install 1AM or Lace extension.');
      }

      const api = await wallet.connect(network);
      const unshielded = await api.getUnshieldedAddress();
      
      // Dynamic import to avoid bundling server code in client
      const { createConnectedSession } = await import('../lib/midnight');
      const connectedSession = await createConnectedSession(api);

      setSession(connectedSession);
      setAddress(unshielded.unshieldedAddress);
      setIsConnected(true);
      setWalletType(type);

      localStorage.setItem('midnight_last_wallet_address', unshielded.unshieldedAddress);
      localStorage.setItem('midnight_last_wallet_type', type);

      return connectedSession;
    } catch (e: any) {
      console.error('Wallet connection failed', e);
      throw e;
    } finally {
      connectingRef.current = false;
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setIsConnected(false);
    setWalletType(null);
    setSession(null);
    setWalletStatus('checking');
    connectingRef.current = false;
    localStorage.removeItem('midnight_last_wallet_address');
    localStorage.removeItem('midnight_last_wallet_type');
  }, []);

  return (
    <WalletContext.Provider value={{
      address,
      isConnected,
      walletType,
      isConnecting,
      walletStatus,
      session,
      connect,
      disconnect,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
