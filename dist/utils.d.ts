import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import { WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
export declare const CONFIG: {
    readonly indexer: "https://indexer.preprod.midnight.network/api/v3/graphql";
    readonly indexerWS: "wss://indexer.preprod.midnight.network/api/v3/graphql/ws";
    readonly node: "https://rpc.preprod.midnight.network";
    readonly proofServer: "http://127.0.0.1:6300";
};
export declare const zkConfigPath: string;
export declare const NFTContractModule: typeof import("../contracts/managed/contract/contract/index.js");
export declare function getCompiledContract(walletAddressBytes: Uint8Array): any;
export declare function deriveKeys(seed: string): Record<0 | 2 | 3, Uint8Array<ArrayBufferLike>>;
export declare function createWallet(seed: string): Promise<{
    seed: string;
    wallet: WalletFacade;
    shieldedSecretKeys: ledger.ZswapSecretKeys;
    dustSecretKey: ledger.DustSecretKey;
    unshieldedKeystore: import("@midnight-ntwrk/wallet-sdk-unshielded-wallet").UnshieldedKeystore;
}>;
export declare function createProviders(walletCtx: Awaited<ReturnType<typeof createWallet>>, customZkPath?: string): Promise<{
    privateStateProvider: import("@midnight-ntwrk/midnight-js-types").PrivateStateProvider<string, any> & {
        invalidateEncryptionCache(): void;
        changePassword(oldPasswordProvider: import("@midnight-ntwrk/midnight-js-level-private-state-provider").PrivateStoragePasswordProvider, newPasswordProvider: import("@midnight-ntwrk/midnight-js-level-private-state-provider").PrivateStoragePasswordProvider, options?: import("@midnight-ntwrk/midnight-js-level-private-state-provider").PasswordRotationOptions): Promise<import("@midnight-ntwrk/midnight-js-level-private-state-provider").PasswordRotationResult>;
        changeSigningKeysPassword(oldPasswordProvider: import("@midnight-ntwrk/midnight-js-level-private-state-provider").PrivateStoragePasswordProvider, newPasswordProvider: import("@midnight-ntwrk/midnight-js-level-private-state-provider").PrivateStoragePasswordProvider, options?: import("@midnight-ntwrk/midnight-js-level-private-state-provider").PasswordRotationOptions): Promise<import("@midnight-ntwrk/midnight-js-level-private-state-provider").PasswordRotationResult>;
    };
    publicDataProvider: import("@midnight-ntwrk/midnight-js-types").PublicDataProvider;
    zkConfigProvider: NodeZkConfigProvider<string>;
    proofProvider: import("@midnight-ntwrk/midnight-js-types").ProofProvider;
    walletProvider: {
        getCoinPublicKey: () => string;
        getEncryptionPublicKey: () => string;
        balanceTx(tx: unknown, ttl?: Date): Promise<ledger.FinalizedTransaction>;
        submitTx: (tx: ledger.FinalizedTransaction) => Promise<string>;
    };
    midnightProvider: {
        getCoinPublicKey: () => string;
        getEncryptionPublicKey: () => string;
        balanceTx(tx: unknown, ttl?: Date): Promise<ledger.FinalizedTransaction>;
        submitTx: (tx: ledger.FinalizedTransaction) => Promise<string>;
    };
}>;
