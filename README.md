# Midnight NFT Launchpad | Multi-Contract ZK Foundry

A professional, high-fidelity web application for deploying and managing **privacy-preserving NFT collections** on the **Midnight Network**. This project implements a fully functional **NFT Launchpad** that bridges a **Next.js Web UI** with the **Midnight.js SDK**, featuring an independent factory pattern for scalable minting.

## 🌌 Overview

Unlike standard NFTs on public chains, Midnight NFTs store their metadata and ownership in **Private Ledger State**. This application allows users to spawn their own independent NFT collections (factories) with custom supply caps and descriptions.

- **Multi-Contract Factories**: Deploy unique smart contract instances for every collection.
- **Private Metadata**: Ownership and metadata are hidden from the public record; only hashes (Commitments) are stored on-chain.
- **ZK Verification**: Owners use Zero-Knowledge proofs locally to "prove" they own their tokens without revealing identity.
- **Circuit-Enforced Caps**: Supply limits are enforced directly within the ZK circuits, ensuring immutable scarcity.
- **Global Registry**: A synchronized API keeps track of all deployed collections and minted tokens.

## 🛡️ Shielded vs. Unshielded NFTs

This launchpad implements **Shielded NFTs**, which differ fundamentally from standard (unshielded) implementations like OpenZeppelin's ERC-721:

| Feature | **Shielded (This Project)** | **Unshielded (Standard)** |
| :--- | :--- | :--- |
| **Visibility** | **Private**: Only owner sees their NFTs. | **Public**: Everyone sees all owners. |
| **Ownership** | Hidden (stored as Commitment hash). | Transparent (stored as Address). |
| **Metadata** | Hidden (stored as local hash). | Transparent (stored as URI/Metadata). |
| **Verification** | Proof-based (ZK circuits). | Ledger-based (Indexers). |

In this project, the **Zero-Knowledge** model ensures that while a token is "on the chain," its identity and ownership are only "revealed" to the owner themselves, or when the owner generates a specific ZK proof to verify their claim.

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js 18+**
- **Docker**: Required to run the Midnight Proof Server (if running your own).
- **1AM Wallet Extension**: Install from [Chrome Web Store](https://chromewebstore.google.com/detail/1am/bphnkdkcnfhompoegfpgnkidcjfbojjp)
- **Midnight Network**: Connect to `preprod` network via 1AM wallet.

### 2. Environment Setup

Clone and install dependencies for both the CLI and UI:

```bash
# Install root/CLI dependencies
npm install

# Install UI dependencies
cd ui
npm install --legacy-peer-deps
```

### 3. Environment Configuration

Create `.env` in root directory:

```bash
MIDNIGHT_INDEXER_URI=https://indexer.preprod.midnight.network/api/v4/graphql
MIDNIGHT_INDEXER_WS_URI=wss://indexer.preprod.midnight.network/api/v4/graphql/ws
MIDNIGHT_NODE_URI=wss://rpc.preprod.midnight.network
```

## 🛠️ Running the Application

### Option A: The Web Dashboard (Recommended)

Start the Next.js development server:

```bash
cd ui
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000).

**Features:**
- **Global Registry**: View all deployed collections across the network.
- **Deploy Factory**: One-click "New Factory" triggers an on-chain deployment of the `collection.compact` contract.
- **Collection Minting**: Select a collection to mint unique tokens with private metadata.
- **ZK Inventory**: View your tokens and hidden metadata, with built-in ZK owner verification.

### Option B: The CLI Tool

For advanced interactions:

```bash
# From the root directory
# 1. Deploy the base contract
npm run cli -- deploy

# 2. Create a new collection (name, description, supply cap)
npm run cli -- create-collection "Moon Birds" "Private avian avatars" 1000

# 3. Mint from a collection
npm run cli -- mint-from-collection <CONTRACT_ADDRESS> "{\"rarity\": \"legendary\"}"

# 4. View your private inventory
npm run cli -- balance
```

## 🏗️ Project Structure

- `contracts/`: **Compact** smart contract logic (`collection.compact`).
- `contracts/managed/`: Compiled contract artifacts (prover keys, verifier keys, ZKIR).
- `ui/lib/`: Core **Midnight.js SDK** implementation (wallet management, ZK-witness providers).
- `ui/app/`: Next.js frontend featuring React Server Components.
- `ui/hooks/`: Real-time state synchronization with the Midnight SDK.
- `ui/public/contract/`: Static ZK artifacts served to `FetchZkConfigProvider`.
- `local-state.json`: The registry for collections and private NFT metadata.

## 🔐 Security & Privacy

- **Shielded State**: Metadata never leaves the secure environment in raw form. Only ZK proofs and commitments are submitted to the public network.
- **Wallet Integration**: Uses 1AM wallet extension for transaction signing and ZK proof generation.
- **Dust-Free**: 1AM's ProofStation sponsors all transaction fees - users don't need NIGHT tokens.

## 🐛 Current Status & Known Issues

### ✅ Working
- Wallet connection (1AM and Lace)
- Contract deployment (create collection)
- Fetching collections and NFTs from indexer
- Static file serving for ZK artifacts

### ⚠️ Blocking Issue: Transaction Submission Error
**Error**: `Invalid Transaction: Custom error: 115` (ZK proof validation failure)

**Root Cause**: The transaction's ZK proof doesn't validate against the deployed contract. This happens when:
- ZK artifacts (prover/verifier keys) don't match the deployed contract
- Contract was deployed with different compilation output

**Attempted Fixes**:
1. ✅ Fixed `FetchZkConfigProvider` - now uses static files at `/contract/collection/`
2. ✅ Fixed `proofProvider` - now has `proveTx` method
3. ✅ Recompiled contracts with `compactc`
4. ✅ Copied fresh artifacts to `ui/public/contract/collection/`
5. ✅ Tried `submitCallTx`, manual prove→balance→submit flow
6. ✅ Verified static files are served correctly (HTTP 200)

**Next Steps**:
- [ ] **Redeploy contract** with newly compiled artifacts
- [ ] Test minting with fresh deployment
- [ ] Verify ZK artifacts match between deployment and minting

### Other Fixed Issues
- ✅ `Cannot read properties of undefined (reading 'getZKIR')` - Fixed by using `FetchZkConfigProvider` with static files
- ✅ `proofProvider.proveTx is not a function` - Fixed by creating custom `proofProvider` with `proveTx` method
- ✅ `balanceUnsealedTransaction` return format - Fixed deserialization
- ✅ SSR errors - Added guards against server-side execution

## 🗺️ Roadmap

### Phase 1: Core Functionality (Current)
- [x] Deploy collection contract
- [x] Basic minting UI
- [ ] **Fix ZK proof validation for minting** (blocking)
- [ ] End-to-end minting flow
- [ ] Transfer NFT functionality
- [ ] ZK ownership verification

### Phase 2: Enhanced Features
- [ ] Multiple collections management
- [ ] NFT metadata rendering
- [ ] Collection supply tracking
- [ ] Transaction history

### Phase 3: Production Ready
- [ ] Error handling improvements
- [ ] Loading states and UX polish
- [ ] Deploy to mainnet
- [ ] Integration with Midnight Explorer

## 🔧 Technical Details

### Providers Setup (Working)
```typescript
// ZK Config Provider - serves static files
const zkConfigProvider = new FetchZkConfigProvider(
  new URL('/contract/collection', window.location.origin).toString(),
  window.fetch.bind(window),
);

// Proof Provider - wraps wallet's proving provider
const proofProvider = {
  async proveTx(unprovenTx, _config) {
    const { CostModel } = await import('@midnight-ntwrk/ledger-v8');
    return unprovenTx.prove(provingProvider, CostModel.initialCostModel());
  },
};

// Wallet Provider - handles transaction balancing
const walletProvider = {
  balanceTx: async (tx) => { /* ... */ },
  getCoinPublicKey: () => shieldedAddress.shieldedCoinPublicKey,
  getEncryptionPublicKey: () => shieldedAddress.shieldedEncryptionPublicKey,
};
```

### Contract Circuits
- `mint`: Create new NFT with metadata (private state)
- `transfer`: Transfer NFT to another address
- `verifyOwnership`: Generate ZK proof of ownership

---

*Built with Midnight SDK v4.0.2, Next.js 16.2.2, and Tailwind CSS.*
