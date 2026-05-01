import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { fileURLToPath } from 'url';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const circuitId = searchParams.get('circuitId');
  
  if (!circuitId) {
    return NextResponse.json({ error: 'Missing circuitId parameter' }, { status: 400 });
  }

  // Look for ZK config in the public/contracts directory
  const possiblePaths = [
    path.join(process.cwd(), 'public', 'contracts', circuitId),
    path.join(process.cwd(), '..', 'contracts', 'managed', circuitId),
  ];

  const fs = await import('fs');
  
  for (const basePath of possiblePaths) {
    const vkPath = path.join(basePath, `${circuitId}.vk`);
    const pkPath = path.join(basePath, `${circuitId}.pk`);
    const circuitPath = path.join(basePath, `${circuitId}.circuit`);
    
    if (fs.existsSync(vkPath) && fs.existsSync(pkPath) && fs.existsSync(circuitPath)) {
      return NextResponse.json({
        [circuitId]: {
          vk: fs.readFileSync(vkPath).toString('base64'),
          pk: fs.readFileSync(pkPath).toString('base64'),
          circuit: fs.readFileSync(circuitPath).toString('base64'),
        }
      });
    }
  }

  return NextResponse.json({ error: `ZK config not found for circuit: ${circuitId}` }, { status: 404 });
}
