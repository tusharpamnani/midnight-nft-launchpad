import { CompiledContract } from '@midnight-ntwrk/compact-js';

const CONTRACT_BASE_URL = '/contracts';

export async function getCompiledNFTContract(contractType: 'contract' | 'collection', callerAddressBytes: Uint8Array) {
  const baseUrl = `${CONTRACT_BASE_URL}/${contractType}`;

  const contractModule = await import(/* @vite-ignore */ `${baseUrl}/contract/index.js`);

  const ContractCtor = contractModule.Contract as any;

  return CompiledContract.make(contractType, ContractCtor).pipe(
    CompiledContract.withWitnesses({
      callerAddress: (_context: any) => [(_context as any).privateState as never, callerAddressBytes],
    }),
    CompiledContract.withCompiledFileAssets(baseUrl),
  ) as any;
}

export async function getContractLedger(contractType: 'contract' | 'collection') {
  const baseUrl = `${CONTRACT_BASE_URL}/${contractType}`;
  const contractModule = await import(/* @vite-ignore */ `${baseUrl}/contract/index.js`);
  return contractModule.ledger;
}
