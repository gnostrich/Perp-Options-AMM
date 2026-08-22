import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { arbitrum, arbitrumSepolia, sepolia } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";

export function getConfig() {
  // Create the base config
  const baseConfig = createConfig({
    chains: [arbitrum, arbitrumSepolia],
    connectors: [metaMask()],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      [arbitrum.id]: http(),
      [arbitrumSepolia.id]: http(),
    },
  });

  // Extend with autoConnect flag without breaking type safety
  return Object.assign(baseConfig, { autoConnect: true });
}

declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}
