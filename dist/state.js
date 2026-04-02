import * as fs from 'node:fs';
const STATE_FILE = 'local-state.json';
export function loadState() {
    if (fs.existsSync(STATE_FILE)) {
        return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    }
    return { ownedTokens: {} };
}
export function saveState(state) {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}
export function addOwnedToken(tokenId, metadataHash, metadata) {
    const state = loadState();
    state.ownedTokens[tokenId] = { tokenId, metadataHash, metadata };
    saveState(state);
}
export function removeOwnedToken(tokenId) {
    const state = loadState();
    delete state.ownedTokens[tokenId];
    saveState(state);
}
export function getOwnedTokens() {
    return loadState().ownedTokens;
}
