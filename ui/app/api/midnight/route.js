"use server";

const { exec } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const { config } = require("dotenv");

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
        if (fs.existsSync(STATE_FILE)) {
          const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
          return new Response(JSON.stringify(state.collections || []));
        }
        return new Response(JSON.stringify([]));
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

      case 'verify': {
        const { tokenId } = params;
        const res = await runCliAction("verify", tokenId);
        return new Response(JSON.stringify(res));
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
