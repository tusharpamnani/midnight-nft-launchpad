"use server";

// Dynamic imports to prevent bundling Node.js modules
const getDeps = async () => {
  const { config } = await import("dotenv");
  const path = await import("path");
  const { exec } = await import("child_process");
  const { promisify } = await import("util");
  const fs = await import("fs");

  config({ path: path.resolve(process.cwd(), "..", ".env") });

  return {
    execAsync: promisify(exec),
    fs,
    path,
    ROOT_DIR: path.resolve(process.cwd(), ".."),
  };
};

async function runCliAction(command: string, ...args: string[]) {
  const { execAsync, ROOT_DIR } = await getDeps();
  const formattedArgs = args.map(arg => 
    arg.includes(' ') || arg.includes('{') ? `'${arg}'` : arg
  ).join(' ');

  const { stdout, stderr } = await execAsync(`npx tsx src/cli.ts ${command} ${formattedArgs}`, {
    cwd: ROOT_DIR,
    env: {
      ...process.env,
      PRIVATE_STATE_PASSWORD: process.env.PRIVATE_STATE_PASSWORD || "Str0ng!MidnightLocal",
    },
    timeout: 180000,
  });

  return { success: true, stdout, stderr };
}

export async function fetchOwnedNFTs() {
  const { fs } = await getDeps();
  const STATE_FILE = `${ROOT_DIR}/local-state.json`;
  if (fs.existsSync(STATE_FILE)) {
    const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    return Object.values(state.ownedTokens || {});
  }
  return [];
}

export async function fetchCollections() {
  const { fs } = await getDeps();
  const STATE_FILE = `${ROOT_DIR}/local-state.json`;
  if (fs.existsSync(STATE_FILE)) {
    const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    return state.collections || [];
  }
  return [];
}

export async function getDeployment() {
  const { fs, path } = await getDeps();
  const deployFile = path.join(ROOT_DIR, 'deployment.json');
  if (fs.existsSync(deployFile)) {
    return JSON.parse(fs.readFileSync(deployFile, 'utf-8'));
  }
  return null;
}

export async function actionCreateCollection(name: string, description: string, maxSupply: number) {
  return await runCliAction("create-collection", name, description, maxSupply.toString());
}

export async function actionMintFromCollection(collectionAddress: string, metadata: string) {
  return await runCliAction("mint-from-collection", collectionAddress, metadata);
}

export async function actionDeploy() {
  return await runCliAction("deploy");
}

export async function actionMint(metadata: string) {
  return await runCliAction("mint", metadata);
}

export async function actionTransfer(tokenId: string, recipient: string) {
  return await runCliAction("transfer", tokenId, recipient);
}

export async function actionVerify(tokenId: string) {
  return await runCliAction("verify", tokenId);
}
