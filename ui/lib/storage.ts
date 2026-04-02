import { OwnedNFT, DeploymentInfo } from '../types/nft';

const OWNED_NFTS_KEY = 'midnight_owned_nfts';
const DEPLOYMENT_INFO_KEY = 'midnight_deployment_info';

export const storage = {
  getOwnedNFTs: (): OwnedNFT[] => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(OWNED_NFTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to read owned NFTs from storage', e);
      return [];
    }
  },

  addOwnedNFT: (nft: OwnedNFT) => {
    if (typeof window === 'undefined') return;
    try {
      const nfts = storage.getOwnedNFTs();
      if (!nfts.find(n => n.tokenId === nft.tokenId)) {
        localStorage.setItem(OWNED_NFTS_KEY, JSON.stringify([...nfts, nft]));
      }
    } catch (e) {
      console.error('Failed to save NFT to storage', e);
    }
  },

  removeOwnedNFT: (tokenId: string) => {
    if (typeof window === 'undefined') return;
    try {
      const nfts = storage.getOwnedNFTs();
      localStorage.setItem(OWNED_NFTS_KEY, JSON.stringify(nfts.filter(n => n.tokenId !== tokenId)));
    } catch (e) {
      console.error('Failed to remove NFT from storage', e);
    }
  },

  getDeployment: (): DeploymentInfo | null => {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(DEPLOYMENT_INFO_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  saveDeployment: (info: DeploymentInfo) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(DEPLOYMENT_INFO_KEY, JSON.stringify(info));
    } catch (e) {
      console.error('Failed to save deployment info', e);
    }
  }
};
