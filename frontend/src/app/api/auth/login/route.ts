import { NextResponse } from 'next/server';
import { verifySignature } from '@/lib/auth/verify-signature';
import { parseMessage } from '@/lib/auth/parse-message';
import { nonceStore } from '@/lib/auth/nonce-store';
import { refreshTokenStore } from '@/lib/auth/refresh-token-store';
import { SignJWT } from 'jose';

export async function POST(request: Request) {
  try {
    const { address, message, signature } = await request.json();

    console.log(`[AUTH] Login attempt started for address: ${address || 'unknown'}`);

    if (!address || !message || !signature) {
      console.warn(`[AUTH] Login failed: Missing parameters for address ${address}`);
      return NextResponse.json({ error: 'Missing parameters', code: 'BAD_REQUEST' }, { status: 400 });
    }

    // 1. Verify signature
    const isValid = await verifySignature(address, message, signature);
    if (!isValid) {
      console.warn(`[AUTH] Login failed: Invalid signature for address ${address}`);
      return NextResponse.json({ error: 'Invalid signature', code: 'INVALID_SIGNATURE' }, { status: 401 });
    }

    // 2. Parse message
    const parsed = parseMessage(message);
    if (!parsed || parsed.action !== 'LOGIN' || parsed.wallet.toLowerCase() !== address.toLowerCase()) {
      console.warn(`[AUTH] Login failed: Invalid message or wallet mismatch for address ${address}`);
      return NextResponse.json({ error: 'Invalid message', code: 'MALFORMED_MESSAGE' }, { status: 400 });
    }

    // 3. Validate timestamp (60s window) & nonce
    const issuedAtMs = new Date(parsed.issuedAt).getTime();
    if (isNaN(issuedAtMs) || Date.now() - issuedAtMs > 60_000) {
      console.warn(`[AUTH] Login failed: Request expired for address ${address}`);
      return NextResponse.json({ error: 'Request expired', code: 'EXPIRED' }, { status: 401 });
    }
    if (nonceStore.has(parsed.nonce)) {
      console.warn(`[AUTH] Login failed: Replay detected for address ${address} (nonce: ${parsed.nonce})`);
      return NextResponse.json({ error: 'Replay detected', code: 'REPLAY' }, { status: 401 });
    }
    nonceStore.add(parsed.nonce);

    // 4. Issue JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('[AUTH] Login failed: JWT_SECRET is not defined in environment variables');
      return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 });
    }

    const token = await new SignJWT({ walletAddress: address })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(new TextEncoder().encode(jwtSecret));

    const refreshToken = refreshTokenStore.issueToken(address);

    console.log(`[AUTH] Login successful for address: ${address}`);
    return NextResponse.json({
      token,
      refreshToken,
      expiresIn: 900
    });
  } catch (error) {
    console.error(`[AUTH] Internal login error for address: unknown`, error);
    return NextResponse.json({ error: 'Internal error', code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
