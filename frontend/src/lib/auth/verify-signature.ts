import { verifyMessage } from 'viem';

/**
 * Verifies an Ethereum personal_sign signature.
 * Uses viem's verifyMessage which handles the EIP-191 prefix internally.
 *
 * @param address - The claimed signer address (0x-prefixed hex)
 * @param message - The raw message string that was signed
 * @param signature - The signature hex string (0x-prefixed)
 * @returns true if the recovered signer matches the claimed address
 */
export async function verifySignature(
  address: string,
  message: string,
  signature: string
): Promise<boolean> {
  try {
    const isValid = await verifyMessage({
      address: address as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });
    return isValid;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}
