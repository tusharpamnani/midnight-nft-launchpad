import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  callerAddress(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  mint(context: __compactRuntime.CircuitContext<PS>, metadataHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  transfer(context: __compactRuntime.CircuitContext<PS>,
           tokenId_0: bigint,
           newOwner_0: Uint8Array,
           tokenMetaHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  verifyOwnership(context: __compactRuntime.CircuitContext<PS>,
                  tokenId_0: bigint,
                  tokenMetaHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  mint(context: __compactRuntime.CircuitContext<PS>, metadataHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  transfer(context: __compactRuntime.CircuitContext<PS>,
           tokenId_0: bigint,
           newOwner_0: Uint8Array,
           tokenMetaHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  verifyOwnership(context: __compactRuntime.CircuitContext<PS>,
                  tokenId_0: bigint,
                  tokenMetaHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  mint(context: __compactRuntime.CircuitContext<PS>, metadataHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  transfer(context: __compactRuntime.CircuitContext<PS>,
           tokenId_0: bigint,
           newOwner_0: Uint8Array,
           tokenMetaHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  verifyOwnership(context: __compactRuntime.CircuitContext<PS>,
                  tokenId_0: bigint,
                  tokenMetaHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly totalSupply: bigint;
  readonly nextTokenId: bigint;
  tokenCommitments: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): Uint8Array;
    [Symbol.iterator](): Iterator<[bigint, Uint8Array]>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
