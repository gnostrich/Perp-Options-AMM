export interface ParsedMessage {
  wallet: string;
  action: string;
  nonce: string;
  issuedAt: string; // ISO-8601 string
}

/**
 * Parses a structured sign message produced by the Chrome extension.
 *
 * Expected format:
 * ```
 * Do you authorize this action?
 *
 * Wallet: 0xFd896b37D83161e56445dCeCaacfE918e028088B
 * Action: LOGIN
 * Nonce: aB3xQ9kL2mNp4rSt
 * Issued At: 2026-06-25T08:15:00.000Z
 * ```
 *
 * @param message - The raw message string
 * @returns Parsed fields or null if the message is malformed
 */
export function parseMessage(message: string): ParsedMessage | null {
  try {
    const walletMatch = message.match(/Wallet:\s*(0x[a-fA-F0-9]{40})/);
    const actionMatch = message.match(/Action:\s*([A-Z_]+)/);
    const nonceMatch = message.match(/Nonce:\s*([A-Za-z0-9]+)/);
    const issuedAtMatch = message.match(/Issued At:\s*(.+)$/m);

    if (!walletMatch || !actionMatch || !nonceMatch || !issuedAtMatch) {
      return null;
    }

    return {
      wallet: walletMatch[1],
      action: actionMatch[1],
      nonce: nonceMatch[1],
      issuedAt: issuedAtMatch[1].trim(),
    };
  } catch {
    return null;
  }
}
