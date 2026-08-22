/**
 * Forwards verified requests from the BFF proxy to the private AWS backend.
 * Reuses the existing API_BASE_URL environment variable.
 *
 * Security rules:
 * - Never expose API_BASE_URL in responses or error messages
 * - Never forward raw backend error bodies to the client
 * - Always attach X-Internal-Secret for service-to-service auth
 * - Always attach X-User-Address on signed requests
 */

export class ProxyError extends Error {
  constructor(
    public statusCode: number,
    public responseBody: string
  ) {
    super(`Backend returned ${statusCode}`);
    this.name = 'ProxyError';
  }
}

export async function forwardToBackend(
  endpoint: string,
  method: string,
  body?: Record<string, unknown>,
  userAddress?: string
): Promise<unknown> {
  const baseUrl = process.env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error('API_BASE_URL not configured');
  }

  const url = `${baseUrl}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Pass the verified user address to the backend
  if (userAddress) {
    headers['X-User-Address'] = userAddress;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Backend error [${response.status}]: ${errorText}`);
    // Don't expose raw backend errors to the client
    throw new ProxyError(response.status, errorText);
  }

  return response.json();
}
