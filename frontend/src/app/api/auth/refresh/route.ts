import { NextResponse } from 'next/server';
import { refreshTokenStore } from '@/lib/auth/refresh-token-store';
import { SignJWT } from 'jose';

export async function POST(request: Request) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json({ error: 'Missing refreshToken', code: 'BAD_REQUEST' }, { status: 400 });
    }

    // 1. Validate refresh token
    const walletAddress = refreshTokenStore.validateToken(refreshToken);
    if (!walletAddress) {
      console.warn(`[AUTH] Refresh failed: Invalid or expired refresh token`);
      return NextResponse.json({ error: 'Invalid or expired refresh token', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('[AUTH] Refresh failed: JWT_SECRET is not defined');
      return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 });
    }

    // 2. Token Rotation: Revoke old refresh token
    refreshTokenStore.revokeToken(refreshToken);

    // 3. Issue new tokens
    const newAccessToken = await new SignJWT({ walletAddress })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(new TextEncoder().encode(jwtSecret));

    const newRefreshToken = refreshTokenStore.issueToken(walletAddress);

    console.log(`[AUTH] Token refreshed successfully for address: ${walletAddress}`);

    return NextResponse.json({
      token: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900
    });
  } catch (error) {
    console.error('[AUTH] Refresh route error:', error);
    return NextResponse.json({ error: 'Internal error', code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
