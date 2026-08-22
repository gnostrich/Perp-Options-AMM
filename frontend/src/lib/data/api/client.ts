/**
 * API Client for backend API calls
 * Centralizes API configuration and base URL handling
 * 
 * NOTE: This module is intended for server-side use only (server actions, server components).
 * Client components should use server actions from src/app/actions/ instead.
 * This ensures API_BASE_URL remains private and is never exposed to the client.
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public statusText?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const getBaseUrl = (): string => {
  const baseUrl = process.env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL is not defined");
  }
  return baseUrl;
};

interface FetchOptions extends RequestInit {
  cache?: RequestCache;
}

/**
 * Makes a fetch request to the backend API
 */
export async function apiFetch(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const defaultOptions: RequestInit = {
    cache: "no-store",
    ...options,
  };

  return fetch(url, defaultOptions);
}

/**
 * Makes a GET request to the backend API
 */
export async function apiGet<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const res = await apiFetch(endpoint, {
    ...options,
    method: "GET",
  });

  if (!res.ok) {
    throw new ApiError(
      `API request failed: ${res.status} ${res.statusText}`,
      res.status,
      res.statusText
    );
  }

  return res.json();
}

/**
 * Makes a POST request to the backend API
 */
export async function apiPost<T>(
  endpoint: string,
  body: unknown,
  options: FetchOptions = {}
): Promise<T> {
  const res = await apiFetch(endpoint, {
    ...options,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new ApiError(
      errorText || `API request failed: ${res.status} ${res.statusText}`,
      res.status,
      res.statusText
    );
  }

  return res.json();
}

/**
 * Makes a PUT request to the backend API
 */
export async function apiPut<T>(
  endpoint: string,
  body: unknown,
  options: FetchOptions = {}
): Promise<T> {
  const res = await apiFetch(endpoint, {
    ...options,
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new ApiError(
      errorText || `API request failed: ${res.status} ${res.statusText}`,
      res.status,
      res.statusText
    );
  }

  return res.json();
}

