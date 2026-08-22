"use client";

import type {
  InitialDataMessageData,
  UpdateDataMessageData,
  InitialUserMessageData,
  UpdateUserMessageData,
} from "./websocket";

export type StreamState = "connecting" | "connected" | "disconnected" | "error";

export interface StreamClient {
  disconnect(): void;
  isConnected(): boolean;
}

export function createDataSseStream(callbacks: {
  onInitialData?: (data: InitialDataMessageData) => void;
  onUpdate?: (data: UpdateDataMessageData) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onStateChange?: (state: StreamState) => void;
}): StreamClient {
  const url = `/api/stream/market-data`;
  const MAX_RETRIES = 5;

  let state: StreamState = "connecting";
  let explicitDisconnect = false;
  let es: EventSource | null = null;
  let retryCount = 0;

  const setState = (next: StreamState) => {
    state = next;
    callbacks.onStateChange?.(next);
  };

  const connect = () => {
    es = new EventSource(url);

    es.onopen = () => {
      if (explicitDisconnect) return;
      retryCount = 0; // reset on successful connection
      setState("connected");
      callbacks.onConnect?.();
    };

    es.onerror = () => {
      if (explicitDisconnect) return;
      retryCount++;
      if (retryCount >= MAX_RETRIES) {
        setState("error");
        callbacks.onError?.(new Error("SSE connection failed after retries"));
        es?.close(); // stop browser auto-reconnect
      }
      // Otherwise, let EventSource auto-reconnect silently
    };

    es.addEventListener("backend_error", (event) => {
      if (explicitDisconnect) return;
      if (!event.data) return;
      try {
        const payload = JSON.parse(event.data) as { message?: string };
        setState("error");
        callbacks.onError?.(new Error(payload.message ?? "Backend stream error"));
      } catch {
        setState("error");
        callbacks.onError?.(new Error("Backend stream error"));
      }
    });

    es.addEventListener("initial", (event) => {
      if (!event.data) return;
      let payload: InitialDataMessageData;
      try {
        payload = JSON.parse(event.data) as InitialDataMessageData;
      } catch (err) {
        console.error("[SSE market-data] JSON parse error:", err, "Raw data:", event.data);
        callbacks.onError?.(err instanceof Error ? err : new Error(String(err)));
        return;
      }
      try {
        callbacks.onInitialData?.(payload);
      } catch (err) {
        console.error("[SSE market-data] Callback handler error:", err);
        callbacks.onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    });

    es.addEventListener("update", (event) => {
      if (!event.data) return;
      let payload: UpdateDataMessageData;
      try {
        payload = JSON.parse(event.data) as UpdateDataMessageData;
      } catch (err) {
        console.error("[SSE market-data] JSON parse error on update:", err, "Raw data:", event.data);
        callbacks.onError?.(err instanceof Error ? err : new Error(String(err)));
        return;
      }
      try {
        callbacks.onUpdate?.(payload);
      } catch (err) {
        console.error("[SSE market-data] Callback handler error on update:", err);
        callbacks.onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    });
  };

  connect();

  return {
    disconnect: () => {
      explicitDisconnect = true;
      es?.close();
      setState("disconnected");
      callbacks.onDisconnect?.();
    },
    isConnected: () => state === "connected" && es?.readyState === EventSource.OPEN,
  };
}

export function createUserSseStream(
  walletAddress: string,
  token: string = "BTC",
  callbacks: {
    onInitialData?: (data: InitialUserMessageData) => void;
    onUpdate?: (data: UpdateUserMessageData) => void;
    onError?: (error: Error) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onStateChange?: (state: StreamState) => void;
  },
  txLimit: number = 20,
  txOffset: number = 0,
  perpLimit: number = 20,
  perpOffset: number = 0
): StreamClient {
  if (!walletAddress) {
    throw new Error("walletAddress is required");
  }

  const url = new URL(`/api/stream/user-data`, window.location.origin);
  url.searchParams.set("wallet", walletAddress);
  url.searchParams.set("token", token);
  url.searchParams.set("txLimit", String(txLimit));
  url.searchParams.set("txOffset", String(txOffset));
  url.searchParams.set("perpLimit", String(perpLimit));
  url.searchParams.set("perpOffset", String(perpOffset));

  const MAX_RETRIES = 5;

  let state: StreamState = "connecting";
  let explicitDisconnect = false;
  let es: EventSource | null = null;
  let retryCount = 0;

  const setState = (next: StreamState) => {
    state = next;
    callbacks.onStateChange?.(next);
  };

  const connect = () => {
    es = new EventSource(url.toString());

    es.onopen = () => {
      if (explicitDisconnect) return;
      retryCount = 0; // reset on successful connection
      setState("connected");
      callbacks.onConnect?.();
    };

    es.onerror = () => {
      if (explicitDisconnect) return;
      retryCount++;
      if (retryCount >= MAX_RETRIES) {
        setState("error");
        callbacks.onError?.(new Error("SSE connection failed after retries"));
        es?.close(); // stop browser auto-reconnect
      }
      // Otherwise, let EventSource auto-reconnect silently
    };

    es.addEventListener("backend_error", (event) => {
      if (explicitDisconnect) return;
      if (!event.data) return;
      try {
        const payload = JSON.parse(event.data) as { message?: string };
        setState("error");
        callbacks.onError?.(new Error(payload.message ?? "Backend stream error"));
      } catch {
        setState("error");
        callbacks.onError?.(new Error("Backend stream error"));
      }
    });

    es.addEventListener("initial", (event) => {
      if (!event.data) return;
      let payload: InitialUserMessageData;
      try {
        payload = JSON.parse(event.data) as InitialUserMessageData;
      } catch (err) {
        console.error("[SSE user-data] JSON parse error:", err, "Raw data:", event.data);
        callbacks.onError?.(err instanceof Error ? err : new Error(String(err)));
        return;
      }
      try {
        callbacks.onInitialData?.(payload);
      } catch (err) {
        console.error("[SSE user-data] Callback handler error:", err);
        callbacks.onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    });

    es.addEventListener("update", (event) => {
      if (!event.data) return;
      let payload: UpdateUserMessageData;
      try {
        payload = JSON.parse(event.data) as UpdateUserMessageData;
      } catch (err) {
        console.error("[SSE user-data] JSON parse error on update:", err, "Raw data:", event.data);
        callbacks.onError?.(err instanceof Error ? err : new Error(String(err)));
        return;
      }
      try {
        callbacks.onUpdate?.(payload);
      } catch (err) {
        console.error("[SSE user-data] Callback handler error on update:", err);
        callbacks.onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    });
  };

  connect();

  return {
    disconnect: () => {
      explicitDisconnect = true;
      es?.close();
      setState("disconnected");
      callbacks.onDisconnect?.();
    },
    isConnected: () => state === "connected" && es?.readyState === EventSource.OPEN,
  };
}

