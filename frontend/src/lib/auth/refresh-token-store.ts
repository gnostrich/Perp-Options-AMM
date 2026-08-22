import crypto from 'crypto';

interface RefreshTokenData {
  walletAddress: string;
  expiresAt: number;
}

/**
 * In-memory refresh token store with TTL-based cleanup.
 * Implements token rotation by allowing issuance and revocation.
 */
class RefreshTokenStore {
  private tokens = new Map<string, RefreshTokenData>();
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor(private defaultTtlMs: number = 7 * 24 * 60 * 60 * 1000) { // 7 days
    // Purge expired tokens every hour
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 60 * 1000);

    // Prevent the interval from keeping the process alive during shutdown
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Generate and store a new refresh token for a given wallet address.
   */
  issueToken(walletAddress: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    this.tokens.set(token, {
      walletAddress,
      expiresAt: Date.now() + this.defaultTtlMs,
    });
    return token;
  }

  /**
   * Validate a refresh token.
   * Returns the wallet address if valid, otherwise null.
   */
  validateToken(token: string): string | null {
    const data = this.tokens.get(token);
    if (!data) return null;

    if (Date.now() > data.expiresAt) {
      this.tokens.delete(token);
      return null;
    }

    return data.walletAddress;
  }

  /**
   * Revoke a refresh token (e.g. on rotation).
   */
  revokeToken(token: string): void {
    this.tokens.delete(token);
  }

  /** Remove expired tokens */
  private cleanup(): void {
    const now = Date.now();
    this.tokens.forEach((data, token) => {
      if (now > data.expiresAt) {
        this.tokens.delete(token);
      }
    });
  }

  /** For testing / monitoring */
  get size(): number {
    return this.tokens.size;
  }
}

// Singleton — survives across requests in the same process
export const refreshTokenStore = new RefreshTokenStore();
