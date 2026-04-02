import * as fs from 'node:fs';

const STATE_FILE = 'local-state.json';

export type AppState = {
  ownedTokens: Record<string, {
    tokenId: string,
    metadataHash: string,
    metadata: string,
    txId?: string
  }>
};

export function loadState(): AppState {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  }
  return { ownedTokens: {} };
}

export function saveState(state: AppState) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

export function addOwnedToken(tokenId: string, metadataHash: string, metadata: string, txId?: string) {
  const state = loadState();
  state.ownedTokens[tokenId] = { tokenId, metadataHash, metadata, txId };
  saveState(state);
}

export function removeOwnedToken(tokenId: string) {
  const state = loadState();
  delete state.ownedTokens[tokenId];
  saveState(state);
}

export function getOwnedTokens() {
  return loadState().ownedTokens;
}
