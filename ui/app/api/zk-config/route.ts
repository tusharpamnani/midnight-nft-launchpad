import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawCircuitId = searchParams.get('circuitId');
  const contractType = searchParams.get('contractType');

  if (!rawCircuitId) {
    return NextResponse.json({ error: 'Missing circuitId parameter' }, { status: 400 });
  }

  // Decode URI-encoded circuit IDs (e.g. "contract%23mint" -> "contract#mint")
  const circuitId = decodeURIComponent(rawCircuitId);

  // Handle qualified circuit IDs like "contract#mint" -> "mint"
  const actualCircuitId = circuitId.includes('#') ? circuitId.split('#')[1] : circuitId;

  try {
    const contractTypes = contractType ? [contractType] : ['contract', 'collection'];
    let zkir: Buffer | null = null;
    let verifierKey: Buffer | null = null;

    for (const type of contractTypes) {
      try {
        const contractsDir = path.join(process.cwd(), 'public', 'contracts', type);
        const zkirPath = path.join(contractsDir, 'zkir', `${actualCircuitId}.zkir`);
        const verifierPath = path.join(contractsDir, 'keys', `${actualCircuitId}.verifier`);


        [zkir, verifierKey] = await Promise.all([
          fs.readFile(zkirPath),
          fs.readFile(verifierPath)
        ]);
        break; // Found it!
      } catch (e) {
        // Try next one
      }
    }

    if (!zkir || !verifierKey) {
      return NextResponse.json({ error: `ZK config not found for circuit: ${circuitId}` }, { status: 404 });
    }

    return NextResponse.json({
      zkir: Array.from(zkir),
      verifierKey: Array.from(verifierKey)
    });
  } catch (error: any) {
    console.error(`Error fetching ZK config for ${circuitId}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
