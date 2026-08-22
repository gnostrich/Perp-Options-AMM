import { NextResponse } from 'next/server';
import { forwardToBackend, ProxyError } from '@/lib/proxy/forward-request';
import { jwtVerify } from 'jose';

/**
 * Endpoint whitelist — prevents SSRF by only allowing known backend paths.
 * POST: exact string match
 * GET:  regex match (dynamic wallet address in path)
 */
const ALLOWED_ENDPOINTS: Record<string, (string | RegExp)[]> = {
  POST: ['/settlements/perps'],
  GET: [/^\/settlements\/users\/0x[a-fA-F0-9]{40}\/perps$/],
};

/** Check if a given method+endpoint combination is whitelisted */
function isEndpointAllowed(method: string, endpoint: string): boolean {
  const patterns = ALLOWED_ENDPOINTS[method.toUpperCase()];
  if (!patterns) return false;

  return patterns.some((pattern) => {
    if (typeof pattern === 'string') {
      return pattern === endpoint;
    }
    return pattern.test(endpoint);
  });
}

/**
 * POST /api/proxy
 *
 * Single proxy endpoint for the Chrome extension.
 * Two request types:
 *   1. Write (POST) — requires JWT in Authorization header
 *   2. Read (GET) — forwarded directly
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    
    const body = await request.json();
    const { payload } = body;

    if (!payload?.endpoint || !payload?.method) {
      console.warn(`[PROXY] Request failed: Missing payload.endpoint or payload.method`);
      return NextResponse.json(
        { error: 'Missing payload.endpoint or payload.method', code: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    console.log(`[PROXY] Request received for ${payload.method} ${payload.endpoint}`);

    // ─── Validate endpoint is whitelisted ───
    if (!isEndpointAllowed(payload.method, payload.endpoint)) {
      console.warn(`[PROXY] Request blocked: Endpoint not allowed (${payload.method} ${payload.endpoint})`);
      return NextResponse.json(
        { error: 'Endpoint not allowed', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    let userAddress: string | undefined;

    // ─── JWT Verification (for write operations) ───
    if (payload.method === 'POST') {
      if (!token) {
        console.warn(`[PROXY] Authentication failed: Missing token for POST request to ${payload.endpoint}`);
        return NextResponse.json({ error: 'Missing token', code: 'UNAUTHORIZED' }, { status: 401 });
      }
      
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error('[PROXY] Authentication failed: JWT_SECRET is not defined');
        return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500 });
      }

      try {
        const { payload: jwtPayload } = await jwtVerify(token, new TextEncoder().encode(jwtSecret));
        userAddress = jwtPayload.walletAddress as string;
        console.log(`[PROXY] Token verified for address: ${userAddress}`);

        // ─── Authorization Check ───
        if (payload.body && typeof payload.body.userWallet === 'string') {
          if (payload.body.userWallet.toLowerCase() !== userAddress.toLowerCase()) {
            console.warn(`[PROXY] Authorization failed: body.userWallet mismatch`);
            return NextResponse.json({ error: 'Wallet mismatch', code: 'FORBIDDEN' }, { status: 403 });
          }
        }

        const addressMatch = payload.endpoint.match(/0x[a-fA-F0-9]{40}/i);
        if (addressMatch) {
          if (addressMatch[0].toLowerCase() !== userAddress.toLowerCase()) {
            console.warn(`[PROXY] Authorization failed: endpoint address mismatch`);
            return NextResponse.json({ error: 'Wallet mismatch', code: 'FORBIDDEN' }, { status: 403 });
          }
        }
      } catch (err) {
        console.warn(`[PROXY] Authentication failed: Invalid or expired token`);
        return NextResponse.json({ error: 'Invalid/expired token', code: 'UNAUTHORIZED' }, { status: 401 });
      }
    }

    // ─── Forward to AWS backend ───
    console.log(`[PROXY] Forwarding ${payload.method} ${payload.endpoint} to backend...`);
    const backendResponse = await forwardToBackend(
      payload.endpoint,
      payload.method,
      payload.body,
      userAddress
    );
    console.log(`[PROXY] Successfully forwarded ${payload.method} ${payload.endpoint}`);

    return NextResponse.json(backendResponse);
  } catch (error) {
    console.error('[PROXY] Proxy route error:', error);

    // Map backend errors to sanitized 502 responses
    if (error instanceof ProxyError) {
      return NextResponse.json(
        { error: 'Backend service error', code: 'BACKEND_ERROR' },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: 'Internal proxy error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

/** Handle CORS preflight requests */
export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
