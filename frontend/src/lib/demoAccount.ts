/**
 * Demo (paper) account identity: a real secp256k1 keypair generated
 * client-side via viem — NOT a fake "0xDemo…" string. The private key IS
 * the login: paste it back in on any browser to resume the same address,
 * or import it into MetaMask/any wallet to promote it to a normal wallet
 * (same derived address, so the paper balance carries over).
 *
 * Trust note: the backend does not verify signatures for ANY account type
 * today (real wallets included — identity is just the address string), so
 * a key-based demo account sits at exactly the same trust level as a
 * connected wallet. The key's value is login/portability, not server-side
 * proof — that changes only if/when SIWE-style signature checks land.
 */
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import type { Hex } from "viem";

export const generateDemoKey = (): Hex => generatePrivateKey();

export const demoAddressFromKey = (key: Hex) => privateKeyToAccount(key).address;

const PRIVATE_KEY_RE = /^0x[0-9a-fA-F]{64}$/;

/** Accepts keys with or without a leading "0x"; trims whitespace. */
export function normalizePrivateKey(raw: string): Hex | null {
  const trimmed = raw.trim();
  const withPrefix = trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
  return PRIVATE_KEY_RE.test(withPrefix) ? (withPrefix as Hex) : null;
}
