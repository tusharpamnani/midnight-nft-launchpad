import { CompiledContract } from '@midnight-ntwrk/compact-js';

const CONTRACT_BASE_URL = '/contracts';

export async function getCompiledNFTContract(contractType: 'contract' | 'collection', callerAddressBytes: Uint8Array) {
  let contractModule;
  
  if (contractType === 'contract') {
    contractModule = await import('../src/contracts/contract/contract/index.js');
  } else {
    contractModule = await import('../src/contracts/collection/contract/index.js');
  }

  const ContractCtor = contractModule.Contract as any;

  return CompiledContract.make(contractType, ContractCtor).pipe(
    CompiledContract.withWitnesses({
      callerAddress: (_context: any) => [(_context as any).privateState as never, callerAddressBytes],
    } as any),
    CompiledContract.withCompiledFileAssets(`/contracts/${contractType}`),
  ) as any;

}


export async function getContractLedger(contractType: 'contract' | 'collection') {
  if (contractType === 'contract') {
    const contractModule = await import('../src/contracts/contract/contract/index.js');
    return contractModule.ledger;
  } else {
    const contractModule = await import('../src/contracts/collection/contract/index.js');
    return contractModule.ledger;
  }
}

