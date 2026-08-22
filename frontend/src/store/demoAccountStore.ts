/* demoAccountStore.ts ---------------------------------------------------
 * Persists the demo (key-based paper) identity across visits. `privateKey`
 * survives a `disconnect()` on purpose — disconnect only ends the active
 * session, it never silently discards the browser's saved key. */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Hex } from "viem";
import { demoAddressFromKey } from "@/lib/demoAccount";

interface DemoAccountState {
  privateKey: Hex | null;
  address: `0x${string}` | null;
  active: boolean;
  /** Derives the address and makes this key the active session. */
  login: (key: Hex) => `0x${string}`;
  /** Ends the session; keeps privateKey/address so the key can resume it. */
  disconnect: () => void;
}

export const useDemoAccountStore = create<DemoAccountState>()(
  persist(
    (set) => ({
      privateKey: null,
      address: null,
      active: false,
      login: (key) => {
        const address = demoAddressFromKey(key);
        set({ privateKey: key, address, active: true });
        return address;
      },
      disconnect: () => set({ active: false }),
    }),
    {
      name: "temporal-demo-account",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
