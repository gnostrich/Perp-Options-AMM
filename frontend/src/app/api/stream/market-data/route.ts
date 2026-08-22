import { WebSocket } from "ws";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const baseUrl = process.env.WEBSOCKET_BASE_URL;
  if (!baseUrl) {
    return new Response("WEBSOCKET_BASE_URL is not defined", { status: 500 });
  }

  const backendUrl = `${baseUrl}/ws/market-data`;
  const encoder = new TextEncoder();

  let ws: WebSocket | null = null;
  let interval: ReturnType<typeof setInterval> | null = null;
  let aborted = false;
  let backoffDelay = 1000;
  const MAX_BACKOFF = 30_000;
  const STABLE_THRESHOLD_MS = 30_000; // only reset backoff if connection lasted this long
  let wsOpenedAt = 0;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const safeEnqueue = (text: string) => {
        try {
          controller.enqueue(encoder.encode(text));
        } catch {
          // Controller can be closed when the client disconnects; ignore late backend events.
        }
      };

      const sendSse = (event: string, data: unknown) => {
        safeEnqueue(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      };

      const sendComment = (comment: string) => {
        safeEnqueue(`: ${comment}\n\n`);
      };

      interval = setInterval(() => {
        sendComment("keep-alive");
      }, 10000);

      // Ensure the browser sees the stream as "alive" immediately.
      sendComment("connected");

      const connectBackend = () => {
        if (aborted) return;

        try {
          ws = new WebSocket(backendUrl);
          console.log(`[SSE market-data] backend WS connecting: ${backendUrl}`);
        } catch (err) {
          console.error(`[SSE market-data] failed to create backend WS:`, err);
          sendSse("backend_error", { message: err instanceof Error ? err.message : String(err) });
          // Retry shortly
          setTimeout(connectBackend, 1000);
          return;
        }

        ws.on("open", () => {
          wsOpenedAt = Date.now();
          console.log(`[SSE market-data] backend WS connected`);
        });

        ws.on("message", (data) => {
          const text = data.toString();
          if (!text || text.trim() === "") return;

          let raw: any;
          try {
            raw = JSON.parse(text);
          } catch {
            return;
          }

          // Match shapes expected by `src/lib/data/api/websocket.ts`
          if (raw?.type === "market_data") {
            const transformed = {
              config: raw.amm_graph?.config,
              long_tree: raw.amm_graph?.long_tree,
              short_tree: raw.amm_graph?.short_tree,
              curve: raw.amm_graph?.curve,
              stats: raw.amm_graph?.stats,
              oracle_price: raw.oracle_price,
            };
            sendSse("initial", transformed);
          } else if (raw?.type === "update") {
            sendSse("update", raw);
          } else if (raw?.type === "initial") {
            // Legacy wrapper (just forward payload if provided)
            sendSse("initial", raw.data ?? raw);
          }
        });

        ws.on("error", (err) => {
          console.error(`[SSE market-data] backend WS error:`, err);
          sendSse("backend_error", { message: err instanceof Error ? err.message : String(err) });
        });

        ws.on("close", (code, reason) => {
          const uptime = Date.now() - wsOpenedAt;
          // Only reset backoff if connection was stable for a meaningful period
          if (uptime >= STABLE_THRESHOLD_MS) {
            backoffDelay = 1000;
          }
          console.warn(
            `[SSE market-data] backend WS closed (code=${code}, uptime=${Math.round(uptime / 1000)}s, reason=${reason?.toString?.() ?? ""}). Reconnecting in ${backoffDelay}ms...`
          );
          // Keep the SSE stream open; just reconnect backend WS with backoff.
          if (!aborted) {
            setTimeout(connectBackend, backoffDelay);
            backoffDelay = Math.min(backoffDelay * 2, MAX_BACKOFF);
          }
        });
      };

      connectBackend();
    },
    cancel() {
      aborted = true;
      if (interval) clearInterval(interval);
      try {
        ws?.close();
      } catch {
        // ignore
      }
    },
  });

  const headers = new Headers();
  headers.set("Content-Type", "text/event-stream; charset=utf-8");
  headers.set("Cache-Control", "no-cache, no-transform");
  headers.set("Connection", "keep-alive");
  headers.set("X-Accel-Buffering", "no");

  req.signal.addEventListener("abort", () => {
    aborted = true;
    try {
      ws?.close();
    } catch {
      // ignore
    }
  });

  return new Response(stream, { headers });
}

