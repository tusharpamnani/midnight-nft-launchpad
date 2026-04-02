# Midnight NFT Private Foundry | ZK-Privacy DApp

A professional, high-fidelity web application for minting and managing **privacy-preserving NFTs** on the **Midnight Network**. This project implements a fully functional bridge between a **Next.js Web UI** and the **Midnight.js SDK CLI**, following a "Local House/Server" wallet pattern for robust ZK proof generation.

## 🌌 Overview

Unlike standard NFTs on public chains, Midnight NFTs store their metadata and ownership in **Private Ledger State**. 

- **Private Metadata**: What you mint is hidden from the public record. Only the hash (Commitment) is stored on-chain.
- **ZK Verification**: Owners use Zero-Knowledge proofs locally to "prove" they own their NFT without revealing the underlying metadata.
- **Encrypted Local State**: Token metadata is stored in a secure local JSON database on the server, synced in real-time with the Web UI.

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js 18+**
- **Docker**: Required to run the Midnight Proof Server.
- **Local Proof Server**: Ensure port `6300` is available.

### 2. Environment Setup

Clone and install dependencies for both the CLI and UI:

```bash
# Install root/CLI dependencies
npm install

# Install UI dependencies (run from ui/ folder)
cd ui
npm install --legacy-peer-deps
```

### 3. Start the ZK Infrastructure

In a separate terminal, start the **Midnight Proof Server** (Docker):

```bash
# From the root directory
npm run start-proof-server
```

## 🛠️ Running the Application

### Option A: The Web Dashboard (Recommended)

Start the Next.js development server:

```bash
cd ui
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000).

- **Deployment**: One-click "Initialize Contract" triggers a server-side deploy.
- **Minting**: Enter JSON or plain text. The server generates a ZK proof and settles it on Preprod.
- **Gallery**: View your tokens and hidden metadata.
- **ZK Verify**: Click the shield icon on any card to confirm your ownership on-chain.

### Option B: The CLI Tool

For power users or headless interactions:

```bash
# From the root directory
# Deploy
npm run cli -- deploy

# Mint
npm run cli -- mint '{"power": 9000, "item": "Excalibur"}'

# View Balance
npm run cli -- balance

# ZK Proof Verification
npm run cli -- verify 1
```

## 🏗️ Project Structure

- `contracts/`: Pure **Compact** smart contract logic (`contract.compact`).
- `src/`: The **Midnight.js SDK** core logic (minting, transferring, ZK-witnesses).
- `ui/app/`: The Next.js frontend and **Server Actions** bridge.
- `ui/hooks/`: React state synchronization with the Midnight SDK backend.
- `local-state.json`: The server-side encrypted vault for private NFT metadata.

## 🔐 Security & Privacy

- **Hardcoded Seed**: For this dev-version, the wallet seed is hardcoded in the backend. 
- **Private State**: Metadata never leaves the server/CLI environment in raw form. Only ZK proofs and commitments touch the public network.

---
*Built with Midnight SDK v8.0.3, Next.js 16.2.2, and Tailwind CSS.*