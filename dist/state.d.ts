export type Collection = {
    id: string;
    name: string;
    description: string;
    maxSupply: number;
    contractAddress: string;
    creatorAddress: string;
    createdAt: string;
};
export type AppState = {
    ownedTokens: Record<string, {
        tokenId: string;
        metadataHash: string;
        metadata: string;
        txId?: string;
        collectionAddress?: string;
    }>;
    collections: Collection[];
};
export declare function loadState(): AppState;
export declare function saveState(state: AppState): void;
export declare function addOwnedToken(tokenId: string, metadataHash: string, metadata: string, txId?: string, collectionAddress?: string): void;
export declare function removeOwnedToken(tokenId: string): void;
export declare function addCollection(collection: Collection): void;
export declare function getCollections(): Collection[];
export declare function getOwnedTokens(): Record<string, {
    tokenId: string;
    metadataHash: string;
    metadata: string;
    txId?: string;
    collectionAddress?: string;
}>;
