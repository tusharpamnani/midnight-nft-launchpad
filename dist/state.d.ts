export type AppState = {
    ownedTokens: Record<string, {
        tokenId: string;
        metadataHash: string;
        metadata: string;
    }>;
};
export declare function loadState(): AppState;
export declare function saveState(state: AppState): void;
export declare function addOwnedToken(tokenId: string, metadataHash: string, metadata: string): void;
export declare function removeOwnedToken(tokenId: string): void;
export declare function getOwnedTokens(): Record<string, {
    tokenId: string;
    metadataHash: string;
    metadata: string;
}>;
