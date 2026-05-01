// Simple deploy API - returns info about client-side deployment
export async function POST(request) {
  return Response.json(
    { error: 'Deploy must be called from client-side using your wallet', clientSide: true },
    { status: 400 }
  );
}
