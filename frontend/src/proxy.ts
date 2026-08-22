import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * CORS proxy for the /api/* routes.
 *
 * Whitelists the Chrome extension origin and localhost dev frontend.
 * Note: Requests from background.js (service worker) do NOT send an Origin
 * header — they bypass CORS entirely. The signature verification in the
 * route handler is the real security layer for write operations.
 */

const ALLOWED_ORIGINS = [
  process.env.EXTENSION_ORIGIN,   // e.g., 'chrome-extension://abcdef123456'
  'http://localhost:3001',         // Dev frontend
].filter(Boolean) as string[];

function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

export function proxy(request: NextRequest) {
  const origin = request.headers.get('origin') ?? '';

  // Handle preflight
  if (request.method === 'OPTIONS') {
    if (ALLOWED_ORIGINS.includes(origin)) {
      return new NextResponse(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }
    return new NextResponse(null, { status: 403 });
  }

  // Handle actual request — attach CORS headers if origin is allowed
  const response = NextResponse.next();
  if (ALLOWED_ORIGINS.includes(origin)) {
    Object.entries(corsHeaders(origin)).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
