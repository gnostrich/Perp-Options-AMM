import { WebSocket } from "ws";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const baseUrl = process.env.WEBSOCKET_BASE_URL;
  if (!baseUrl) {
    return new Response("WEBSOCKET_BASE_URL is not defined", { status: 500 });
  }

  const url = new URL(req.url);
  const wallet = url.searchParams.get("wallet");
  const token = url.searchParams.get("token") ?? "BTC";

  const txLimit = Number(url.searchParams.get("txLimit") ?? 20);
  const txOffset = Number(url.searchParams.get("txOffset") ?? 0);
  const perpLimit = Number(url.searchParams.get("perpLimit") ?? 20);
  const perpOffset = Number(url.searchParams.get("perpOffset") ?? 0);

  if (!wallet) {
    return new Response("wallet is required", { status: 400 });
  }

  const backendUrl = `${baseUrl}/ws/user-data`;
  const encoder = new TextEncoder();

  let ws: WebSocket | null = null;
  let interval: ReturnType<typeof setInterval> | null = null;
  let aborted = false;
  let backoffDelay = 1000;
  const MAX_BACKOFF = 30_000;
  const STABLE_THRESHOLD_MS = 30_000;
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
          console.log(`[SSE user-data] backend WS connecting: ${backendUrl}`);
        } catch (err) {
          console.error(`[SSE user-data] failed to create backend WS:`, err);
          sendSse("backend_error", { message: err instanceof Error ? err.message : String(err) });
          setTimeout(connectBackend, 1000);
          return;
        }

        ws.on("open", () => {
          wsOpenedAt = Date.now();
          console.log(`[SSE user-data] backend WS connected`);
          const subscribeMessage = {
            wallet,
            token,
            market: `${token}-PERP`,
            tx_limit: txLimit,
            tx_offset: txOffset,
            perp_limit: perpLimit,
            perp_offset: perpOffset,
          };
          ws?.send(JSON.stringify(subscribeMessage));
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

          if (raw?.type === "user_data") {
            const transformed = {
              transactions: raw.transactions,
              perps: raw.perps,
              earn_positions: Array.isArray(raw.earn_positions)
                ? raw.earn_positions
                : [],
              liquidation_floor: raw.liquidation_floor,
              perps_totals: raw.perps_totals,
              pnl_live: raw.pnl_live ?? null,
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
          console.error(`[SSE user-data] backend WS error:`, err);
          sendSse("backend_error", { message: err instanceof Error ? err.message : String(err) });
        });

        ws.on("close", (code, reason) => {
          const uptime = Date.now() - wsOpenedAt;
          if (uptime >= STABLE_THRESHOLD_MS) {
            backoffDelay = 1000;
          }
          console.warn(
            `[SSE user-data] backend WS closed (code=${code}, uptime=${Math.round(uptime / 1000)}s, reason=${reason?.toString?.() ?? ""}). Reconnecting in ${backoffDelay}ms...`
          );
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

