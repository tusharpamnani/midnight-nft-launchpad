'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

const DETECT_TIMEOUT_MS = 6000;
const DETECT_INTERVAL_MS = 300;

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [walletType, setWalletType] = useState<'1am' | 'lace' | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletStatus, setWalletStatus] = useState<'checking' | 'detected' | 'not-found'>('checking');
  const [api, setApi] = useState<any>(null);
  
  // Use a ref to track if we're already connecting (synchronous check)
  const connectingRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (connectingRef.current) return; // Already connecting, skip
    
    let mounted = true;
    const startedAt = Date.now();

    const checkWallet = async () => {
      if (!mounted) return true;
      
      const wallet1AM = (window as any).midnight?.['1am'];
      const walletLace = (window as any).midnight?.mnLace;

      if (wallet1AM || walletLace) {
        const type = wallet1AM ? '1am' as const : 'lace' as const;
        if (mounted) {
          setWalletType(type);
          setWalletStatus('detected');
          
          // Auto-connect only if not already connected and not already connecting
          if (!isConnected && !connectingRef.current) {
            connect('preprod').catch(() => {});
          }
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
  }, [isConnected]);

  const connect = useCallback(async (network: string = 'preprod') => {
    // Synchronous check to prevent concurrent calls
    if (connectingRef.current) {
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

      const connectedApi = await wallet.connect(network);
      const unshielded = await connectedApi.getUnshieldedAddress();

      setApi(connectedApi);
      setAddress(unshielded.unshieldedAddress);
      setIsConnected(true);
      setWalletType(type);

      localStorage.setItem('midnight_last_wallet_address', unshielded.unshieldedAddress);
      localStorage.setItem('midnight_last_wallet_type', type);

      return connectedApi;
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
    setApi(null);
    setWalletStatus('checking');
    connectingRef.current = false;
    localStorage.removeItem('midnight_last_wallet_address');
    localStorage.removeItem('midnight_last_wallet_type');
  }, []);

  return {
    address,
    isConnected,
    walletType,
    isConnecting,
    walletStatus,
    api,
    connect,
    disconnect,
  };
}
