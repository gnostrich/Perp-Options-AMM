/**
 * In-memory nonce store with TTL-based cleanup.
 * Prevents replay attacks by tracking used nonces.
 *
 * Each nonce is stored with its insertion timestamp and purged
 * after the TTL expires. The has/add interface is designed for
 * easy migration to Redis or DynamoDB when scaling to multiple instances.
 */
class NonceStore {
  private nonces = new Map<string, number>(); // nonce → insertion timestamp (ms)
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor(private ttlMs: number = 5 * 60 * 1000) {
    // Purge expired nonces every 60 seconds
    this.cleanupInterval = setInterval(() => this.cleanup(), 60_000);

    // Prevent the interval from keeping the process alive during shutdown
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /** Check if a nonce has already been used */
  has(nonce: string): boolean {
    return this.nonces.has(nonce);
  }

  /** Record a nonce as used */
  add(nonce: string): void {
    this.nonces.set(nonce, Date.now());
  }

  /** Remove expired nonces */
  private cleanup(): void {
    const now = Date.now();
    this.nonces.forEach((timestamp, nonce) => {
      if (now - timestamp > this.ttlMs) {
        this.nonces.delete(nonce);
      }
    });
  }

  /** For testing / monitoring */
  get size(): number {
    return this.nonces.size;
  }
}

// Singleton — survives across requests in the same process
export const nonceStore = new NonceStore();
