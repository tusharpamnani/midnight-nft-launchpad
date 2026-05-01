"use server";

const { exec } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const { config } = require("dotenv");

config({ path: path.resolve(process.cwd(), "..", ".env") });

const ROOT_DIR = path.resolve(process.cwd(), "..");
const DEPLOY_FILE = path.join(ROOT_DIR, 'deployment.json');

const execAsync = promisify(exec);

exports.GET = async function GET() {
  if (fs.existsSync(DEPLOY_FILE)) {
    return new Response(JSON.stringify(JSON.parse(fs.readFileSync(DEPLOY_FILE, 'utf-8'))));
  }
  return new Response(JSON.stringify(null));
};

exports.POST = async function POST() {
  try {
    const { stdout, stderr } = await execAsync("npx tsx src/cli.ts deploy", {
      cwd: ROOT_DIR,
      env: {
        ...process.env,
        PRIVATE_STATE_PASSWORD: process.env.PRIVATE_STATE_PASSWORD || "Str0ng!MidnightLocal",
      },
      timeout: 180000,
    });
    return new Response(JSON.stringify({ success: true, stdout, stderr }));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
