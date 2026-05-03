"use server";

import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { config } from "dotenv";

config({ path: path.resolve(process.cwd(), "..", ".env") });

const ROOT_DIR = path.resolve(process.cwd(), "..");
const DEPLOY_FILE = path.join(ROOT_DIR, 'deployment.json');

const execAsync = promisify(exec);

export async function GET() {
  if (fs.existsSync(DEPLOY_FILE)) {
    return new Response(JSON.stringify(JSON.parse(fs.readFileSync(DEPLOY_FILE, 'utf-8'))));
  }
  return new Response(JSON.stringify(null));
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { contractAddress, network } = data;
    
    if (!contractAddress) {
      return new Response(JSON.stringify({ error: 'Missing contractAddress' }), { status: 400 });
    }

    const deploymentInfo = {
      contractAddress,
      network: network || 'preprod',
      deployedAt: new Date().toISOString()
    };

    fs.writeFileSync(DEPLOY_FILE, JSON.stringify(deploymentInfo, null, 2));
    
    return new Response(JSON.stringify({ success: true, deploymentInfo }));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}


