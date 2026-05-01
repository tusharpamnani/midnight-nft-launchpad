export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{ trait_type: string; value: string }>;
}

export interface OwnedNFT {
  id: string;
  metadata: NFTMetadata;
  collectionAddress?: string;
}

export interface DeploymentInfo {
  contractAddress: string;
  network: string;
  deployedAt: string;
  blockHeight?: number;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  walletType: '1am' | 'lace' | null;
  isConnecting: boolean;
  walletStatus: 'checking' | 'detected' | 'not-found';
  api: any;
}

export interface CollectionInfo {
  address: string;
  name: string;
  description: string;
  maxSupply: number;
  currentSupply: number;
}

export interface NFTInfo {
  id: string;
  metadata: string;
  metadataHash?: string;
  txId?: string;
  collectionAddress?: string;
}
