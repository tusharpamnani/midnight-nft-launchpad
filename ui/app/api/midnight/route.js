"use server";

import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { config } from "dotenv";
import crypto from "crypto";

config({ path: path.resolve(process.cwd(), "..", ".env") });

const ROOT_DIR = path.resolve(process.cwd(), "..");
const STATE_FILE = path.join(ROOT_DIR, 'local-state.json');
const DEPLOY_FILE = path.join(ROOT_DIR, 'deployment.json');

const execAsync = promisify(exec);


async function runCliAction(command, ...args) {
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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'owned-nfts': {
        if (fs.existsSync(STATE_FILE)) {
          const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
          return new Response(JSON.stringify(Object.values(state.ownedTokens || {})));
        }
        return new Response(JSON.stringify([]));
      }

       case 'collections': {
        const collections = [];
        if (fs.existsSync(STATE_FILE)) {
          const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
          if (state.collections) {
            for (const col of state.collections) {
              // Normalize: support both `address` and `contractAddress` field names
              collections.push({
                address: col.address || col.contractAddress,
                name: col.name || 'Unnamed',
                description: col.description || '',
                maxSupply: col.maxSupply || 0,
                currentSupply: col.currentSupply || 0,
              });
            }
          }
        }
        return new Response(JSON.stringify(collections));
      }

      case 'deployment': {
        if (fs.existsSync(DEPLOY_FILE)) {
          return new Response(JSON.stringify(JSON.parse(fs.readFileSync(DEPLOY_FILE, 'utf-8'))));
        }
        return new Response(JSON.stringify(null));
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'create-collection': {
        const { name, description, maxSupply } = params;
        const res = await runCliAction("create-collection", name, description, maxSupply.toString());
        return new Response(JSON.stringify(res));
      }

      case 'mint-from-collection': {
        const { collectionAddress, metadata } = params;
        const res = await runCliAction("mint-from-collection", collectionAddress, metadata);
        return new Response(JSON.stringify(res));
      }

      case 'deploy': {
        const res = await runCliAction("deploy");
        return new Response(JSON.stringify(res));
      }

      case 'mint': {
        const { metadata } = params;
        const res = await runCliAction("mint", metadata);
        return new Response(JSON.stringify(res));
      }

      case 'transfer': {
        const { tokenId, recipient } = params;
        const res = await runCliAction("transfer", tokenId, recipient);
        return new Response(JSON.stringify(res));
      }

       case 'add-collection': {
        const { address, name, description, maxSupply } = params;
        let state = { collections: [], ownedTokens: {} };
        if (fs.existsSync(STATE_FILE)) {
          state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
        }
        if (!state.collections) state.collections = [];
        state.collections.push({
          id: crypto.randomUUID(),
          name: name || 'Unnamed',
          description: description || '',
          maxSupply: maxSupply || 0,
          contractAddress: address,
          creatorAddress: '',
          createdAt: new Date().toISOString()
        });
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
        return new Response(JSON.stringify({ success: true }));
      }

      case 'add-nft': {
        const { tokenId, metadata, txId, collectionAddress } = params;
        let state = { collections: [], ownedTokens: {} };
        if (fs.existsSync(STATE_FILE)) {
          state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
        }
        if (!state.ownedTokens) state.ownedTokens = {};
        state.ownedTokens[tokenId] = {
          tokenId,
          metadataHash: crypto.createHash('sha256').update(metadata).digest('hex'),
          metadata,
          txId,
          collectionAddress
        };
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
        return new Response(JSON.stringify({ success: true }));
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
