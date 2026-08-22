import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self'; 
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; 
              worker-src 'self' blob:;
              style-src 'self' https://fonts.googleapis.com 'unsafe-inline' 'unsafe-hashes' data: blob:;
              font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com data:; 
              connect-src 'self'  ws://localhost:* wss://localhost:* ws://staging-be.temporal.exchange wss://staging-be.temporal.exchange wss://api.hyperliquid.xyz wss://api.hyperliquid-testnet.xyz https://api.hyperliquid.xyz https://api.hyperliquid-testnet.xyz https://www.google-analytics.com https://www.googletagmanager.com https://mm-sdk-analytics.api.cx.metamask.io https://metamask-sdk.api.cx.metamask.io wss://metamask-sdk.api.cx.metamask.io https://arb1.arbitrum.io https://arbitrum-one.publicnode.com https://rpc.ankr.com/arbitrum https://arbitrum-sepolia.publicnode.com;
              img-src 'self' https://www.google-analytics.com data: blob:;
              frame-src 'none';
              object-src 'none';
              base-uri 'self';
              upgrade-insecure-requests;
            `.replace(/\s{2,}/g, " ").trim(),
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;