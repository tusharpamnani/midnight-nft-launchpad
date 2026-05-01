'use client';

import { useState, useCallback, useEffect } from 'react';
import { DeploymentInfo } from '../types/nft';

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

  const deploy = useCallback(async (api: any) => {
    setIsDeploying(true);
    addLog('Starting contract deployment from your wallet...');

    try {
      addLog('Submitting deployment transaction (may take 30-60s for ZK proof)...');

      // Call the server API to deploy (uses server wallet for now)
      const res = await fetch('/api/deploy', { method: 'POST' });
      const result = await res.json();

      if (result.stdout) addLog(result.stdout);

      await fetchDeploymentState();
      addLog('Deployment complete! 🎉');

      return deployment?.contractAddress;
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
  };
}
