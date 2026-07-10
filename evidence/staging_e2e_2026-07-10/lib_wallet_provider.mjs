// lib_wallet_provider.mjs — headless EIP-1193 provider injection for Playwright.
// The throwaway PRIVATE KEY is read from /tmp/throwaway_wallet.key and lives ONLY in
// this Node process (ethers Wallet). The page gets exposeFunction bridges — the key
// never appears in page JS, logs, or reports. TESTNET ONLY (Arbitrum Sepolia 421614).
import fs from 'node:fs';
import { Wallet, JsonRpcProvider, FetchRequest } from 'ethers';

// Route ethers HTTP through global fetch so the agent proxy (HTTPS_PROXY +
// NODE_USE_ENV_PROXY=1 + NODE_EXTRA_CA_CERTS) is honored.
FetchRequest.registerGetUrl(async (req) => {
  const resp = await fetch(req.url, { method: req.method, headers: req.headers, body: req.body ?? undefined });
  const buf = new Uint8Array(await resp.arrayBuffer());
  const headers = {}; resp.headers.forEach((v, k) => { headers[k] = v; });
  return { statusCode: resp.status, statusMessage: resp.statusText, headers, body: buf };
});

export const CHAIN_ID_HEX = '0x66eee'; // 421614 Arbitrum Sepolia
export const CHAIN_ID_DEC = '421614';
export const RPC_URL = 'https://arbitrum-sepolia.publicnode.com';

export function loadWallet() {
  const pk = fs.readFileSync('/tmp/throwaway_wallet.key', 'utf8').trim();
  const provider = new JsonRpcProvider(RPC_URL, 421614, { staticNetwork: true });
  const wallet = new Wallet(pk, provider);
  return { wallet, provider };
}

// Call BEFORE page.goto. Wires Node-side signing bridges + init script provider.
export async function installProvider(page, wallet, provider, log = () => {}) {
  const address = await wallet.getAddress();

  await page.exposeFunction('__tw_sign_personal', async (msgHex) => {
    // personal_sign gives hex-encoded message bytes
    try {
      const bytes = msgHex.startsWith('0x')
        ? Buffer.from(msgHex.slice(2), 'hex')
        : Buffer.from(msgHex, 'utf8');
      log(`[wallet] personal_sign (${bytes.length} bytes): ${JSON.stringify(bytes.toString('utf8').slice(0, 300))}`);
      return await wallet.signMessage(bytes);
    } catch (e) { log(`[wallet] personal_sign ERROR ${e.message}`); throw e; }
  });

  await page.exposeFunction('__tw_sign_typed', async (payloadJson) => {
    try {
      const p = typeof payloadJson === 'string' ? JSON.parse(payloadJson) : payloadJson;
      const types = { ...p.types };
      delete types.EIP712Domain;
      log(`[wallet] eth_signTypedData_v4 primaryType=${p.primaryType} domain=${JSON.stringify(p.domain)}`);
      return await wallet.signTypedData(p.domain, types, p.message);
    } catch (e) { log(`[wallet] signTypedData ERROR ${e.message}`); throw e; }
  });

  await page.exposeFunction('__tw_send_tx', async (txJson) => {
    try {
      const t = typeof txJson === 'string' ? JSON.parse(txJson) : txJson;
      log(`[wallet] eth_sendTransaction to=${t.to} value=${t.value || '0x0'} dataLen=${(t.data || '0x').length}`);
      const tx = await wallet.sendTransaction({
        to: t.to, data: t.data, value: t.value ? BigInt(t.value) : undefined,
        gasLimit: t.gas ? BigInt(t.gas) : undefined,
      });
      log(`[wallet] tx sent hash=${tx.hash}`);
      return tx.hash;
    } catch (e) { log(`[wallet] sendTransaction ERROR ${e.message}`); throw e; }
  });

  await page.exposeFunction('__tw_rpc', async (method, paramsJson) => {
    const params = JSON.parse(paramsJson || '[]');
    try {
      return await provider.send(method, params);
    } catch (e) {
      log(`[wallet] rpc proxy ${method} ERROR ${e.message}`);
      throw e;
    }
  });

  await page.addInitScript(({ address, chainIdHex, chainIdDec }) => {
    const listeners = {};
    const on = (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); return ethereum; };
    const emit = (ev, ...args) => (listeners[ev] || []).forEach(f => { try { f(...args); } catch (_) {} });
    let connected = false;

    const request = async ({ method, params = [] }) => {
      switch (method) {
        case 'eth_requestAccounts':
          if (!connected) { connected = true; setTimeout(() => emit('connect', { chainId: chainIdHex }), 0); }
          setTimeout(() => emit('accountsChanged', [address]), 0);
          return [address];
        case 'eth_accounts':
          return connected ? [address] : [address]; // pre-approved throwaway
        case 'eth_chainId': return chainIdHex;
        case 'net_version': return chainIdDec;
        case 'eth_coinbase': return address;
        case 'personal_sign': {
          // params: [message, address] (some dapps flip)
          const msg = (params[0] && params[0].toLowerCase && params[0].toLowerCase() === address.toLowerCase()) ? params[1] : params[0];
          return await window.__tw_sign_personal(msg);
        }
        case 'eth_sign': {
          const msg = (params[0] && params[0].toLowerCase() === address.toLowerCase()) ? params[1] : params[0];
          return await window.__tw_sign_personal(msg);
        }
        case 'eth_signTypedData':
        case 'eth_signTypedData_v3':
        case 'eth_signTypedData_v4': {
          const payload = typeof params[1] === 'string' ? params[1] : (typeof params[0] === 'string' && params[0].startsWith('{') ? params[0] : JSON.stringify(params[1] || params[0]));
          return await window.__tw_sign_typed(payload);
        }
        case 'eth_sendTransaction':
          return await window.__tw_send_tx(JSON.stringify(params[0]));
        case 'wallet_switchEthereumChain': {
          const want = params[0] && params[0].chainId;
          if (want && want.toLowerCase() === chainIdHex) { setTimeout(() => emit('chainChanged', chainIdHex), 0); return null; }
          const err = new Error('Unrecognized chain (testnet-only provider)'); err.code = 4902; throw err;
        }
        case 'wallet_addEthereumChain': return null;
        case 'wallet_requestPermissions':
        case 'wallet_getPermissions':
          return [{ parentCapability: 'eth_accounts', caveats: [] }];
        case 'wallet_revokePermissions': return null;
        case 'web3_clientVersion': return 'ThrowawayTestProvider/1.0.0';
        default:
          // read-path proxy to the public Arbitrum-Sepolia RPC
          return await window.__tw_rpc(method, JSON.stringify(params));
      }
    };

    const ethereum = {
      isMetaMask: true,
      isThrowawayTestProvider: true,
      _metamask: { isUnlocked: async () => true },
      selectedAddress: address,
      chainId: chainIdHex,
      networkVersion: chainIdDec,
      request,
      on,
      once: (ev, fn) => { const g = (...a) => { fn(...a); ethereum.removeListener(ev, g); }; return on(ev, g); },
      removeListener: (ev, fn) => { listeners[ev] = (listeners[ev] || []).filter(f => f !== fn); return ethereum; },
      removeAllListeners: (ev) => { if (ev) delete listeners[ev]; else Object.keys(listeners).forEach(k => delete listeners[k]); return ethereum; },
      enable: () => request({ method: 'eth_requestAccounts' }),
      send: (methodOrPayload, paramsOrCb) => {
        if (typeof methodOrPayload === 'string') return request({ method: methodOrPayload, params: paramsOrCb || [] });
        return request(methodOrPayload);
      },
      sendAsync: (payload, cb) => {
        request(payload).then(r => cb(null, { id: payload.id, jsonrpc: '2.0', result: r }))
          .catch(e => cb(e, null));
      },
    };

    Object.defineProperty(window, 'ethereum', { value: ethereum, writable: false, configurable: true });

    // EIP-6963 announcement (wagmi / MetaMask SDK discovery)
    const info = {
      uuid: 'a1b2c3d4-0000-4000-8000-throwaway001'.replace('throwaway001', '1ea7c0de0001'),
      name: 'MetaMask',
      icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjZjY4NTFiIi8+PC9zdmc+',
      rdns: 'io.metamask',
    };
    const announce = () => window.dispatchEvent(new CustomEvent('eip6963:announceProvider', {
      detail: Object.freeze({ info, provider: ethereum }),
    }));
    window.addEventListener('eip6963:requestProvider', announce);
    announce();
    window.__tw_announce = announce;
  }, { address, chainIdHex: CHAIN_ID_HEX, chainIdDec: CHAIN_ID_DEC });

  return address;
}

// Page instrumentation: console / pageerror / failed requests / ws events → array sink
export function instrument(page, sink) {
  const push = (kind, text) => sink.push({ t: new Date().toISOString(), kind, text });
  page.on('console', (m) => {
    const ty = m.type();
    if (ty === 'error' || ty === 'warning') push(`console.${ty}`, m.text().slice(0, 2000));
  });
  page.on('pageerror', (e) => push('pageerror', String(e).slice(0, 2000)));
  page.on('requestfailed', (r) => {
    const f = r.failure();
    push('requestfailed', `${r.method()} ${r.url().slice(0, 300)} → ${f ? f.errorText : '?'}`);
  });
  page.on('response', (r) => {
    if (r.status() >= 400) push('http4xx5xx', `${r.status()} ${r.request().method()} ${r.url().slice(0, 300)}`);
  });
  page.on('websocket', (ws) => {
    push('ws.open', ws.url().slice(0, 300));
    ws.on('close', () => push('ws.close', ws.url().slice(0, 300)));
    ws.on('socketerror', (e) => push('ws.error', `${ws.url().slice(0, 200)} → ${e}`));
  });
}

export function chromiumLaunchOpts() {
  return {
    headless: true,
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    proxy: { server: process.env.HTTPS_PROXY || 'http://127.0.0.1:45981' },
    // TLS 1.2 max: the agent-proxy MITM resets Chrome's TLS 1.3 handshake
    // (verified via netlog ECONNRESET). CA trust is via the NSS store (proxy CAs
    // imported with certutil). This does NOT disable verification.
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-quic',
      '--disable-background-networking', '--disable-component-update', '--disable-sync',
      '--no-first-run', '--no-default-browser-check', '--disable-domain-reliability',
      '--disable-features=PostQuantumKyber,EncryptedClientHello,TLS13EarlyData,OptimizationHints,MediaRouter,NetworkTimeServiceQuerying',
      '--ssl-version-max=tls1.2'],
    };
}
