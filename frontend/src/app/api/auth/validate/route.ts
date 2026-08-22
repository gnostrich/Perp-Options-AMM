import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return NextResponse.json({ error: 'Missing token', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('[AUTH] Validate failed: JWT_SECRET is not defined');
      return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 });
    }

    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(jwtSecret));
      
      const walletAddress = payload.walletAddress as string;
      const exp = payload.exp as number; // Expiration time in seconds since epoch

      const expiresIn = Math.max(0, exp - Math.floor(Date.now() / 1000));

      return NextResponse.json({
        valid: true,
        address: walletAddress,
        expiresIn
      });
    } catch (err) {
      console.warn(`[AUTH] Validate failed: Invalid or expired token`);
      return NextResponse.json({ error: 'Invalid or expired token', code: 'UNAUTHORIZED' }, { status: 401 });
    }
  } catch (error) {
    console.error('[AUTH] Validate route error:', error);
    return NextResponse.json({ error: 'Internal error', code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
