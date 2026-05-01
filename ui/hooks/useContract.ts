'use client';
import { useState, useCallback, useEffect } from 'react';
import { DeploymentInfo } from '../types/nft';
import { createUnprovenDeployTx, submitTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
import { sampleSigningKey } from '@midnight-ntwrk/compact-runtime';
import { getCompiledNFTContract } from '../lib/contracts';
import { UnshieldedAddress, MidnightBech32m } from '@midnight-ntwrk/wallet-sdk-address-format';


export function useContract() {
  const [deployment, setDeployment] = useState<DeploymentInfo | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);

  const fetchDeploymentState = useCallback(async () => {
    try {
      const res = await fetch('/api/deployment');
      if (res.ok) {
        const info = await res.json();
        if (info && info.contractAddress) {
          setDeployment({
            contractAddress: info.contractAddress,
            network: 'preprod',
            deployedAt: info.deployedAt || new Date().toISOString()
          });
        } else {
          setDeployment(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchDeploymentState();
  }, [fetchDeploymentState]);

  const addLog = useCallback((msg: string) => {
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
  }, []);

  const deploy = useCallback(async (session: any) => {
    setIsDeploying(true);
    addLog('Starting contract deployment from your wallet...');

    try {
      addLog('Generating ZK proof and submitting to network...');

      // Get the caller address bytes from the session
      const networkId = session.config.networkId;
      const callerAddressBytes = MidnightBech32m.parse(session.unshieldedAddress)
        .decode(UnshieldedAddress, networkId).data;

      // Use the utility to get the properly wrapped compiled contract
      const compiledContract = await getCompiledNFTContract('contract', callerAddressBytes);

      const deployTxData = await createUnprovenDeployTx(
        {
          zkConfigProvider: session.providers.zkConfigProvider,
          walletProvider: session.providers.walletProvider,
        },
        {
          compiledContract,
          args: [], 
          signingKey: sampleSigningKey(),
        },
      );







      addLog(`Contract address: ${deployTxData.public.contractAddress}`);

      const txId = await submitTxAsync(
        session.providers,
        {
          unprovenTx: deployTxData.private.unprovenTx,
        },
      );

      // Save signing key for later contract calls
      await session.providers.privateStateProvider.setContractAddress(deployTxData.public.contractAddress);
      await session.providers.privateStateProvider.setSigningKey(
        deployTxData.public.contractAddress,
        deployTxData.private.signingKey,
      );

       // Save deployment address to server
       await fetch('/api/deployment', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ 
           contractAddress: deployTxData.public.contractAddress, 
           network: 'preprod' 
         })
       });

      addLog(`Deployment complete! TxID: ${txId}`);
      addLog('Contract deployed! 🎉');

      await fetchDeploymentState();
      return deployTxData.public.contractAddress;
    } catch (e: any) {
      addLog(`Error: ${e.message}`);
      throw e;
    } finally {
      setIsDeploying(false);
    }
  }, [addLog, fetchDeploymentState]);

  return {
    deployment,
    deploy,
    log,
    addLog,
    isDeploying,
    refreshDeployment: fetchDeploymentState,
  };
}

