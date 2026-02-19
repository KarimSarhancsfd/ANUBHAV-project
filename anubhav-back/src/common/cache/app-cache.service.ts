import { Injectable, Logger } from '@nestjs/common';

interface CacheEntry<T> {
  value: T;
  expiresAt: number; // Unix ms timestamp
}

/**
 * PERF: Lightweight in-memory TTL cache service.
 *
 * Design goals:
 * - Zero dependencies — no Redis needed for current scale
 * - Redis-ready interface — replacing the implementation does NOT require
 *   changing any consumer (just swap this class with a Redis-backed one)
 * - Auto-expiry on read — no background sweeper needed at this scale
 * - Prefix-based invalidation — useful for per-user cache busting
 *
 * Usage:
 *   this.cache.set('config:xp_multiplier', 1.5, 60_000); // 60s TTL
 *   const val = this.cache.get<number>('config:xp_multiplier');
 *   this.cache.invalidate('config:xp_multiplier');
 *   this.cache.invalidateByPrefix('config:');
 */
@Injectable()
export class AppCacheService {
  private readonly logger = new Logger(AppCacheService.name);
  private readonly store = new Map<string, CacheEntry<unknown>>();

  /**
   * Get a cached value. Returns undefined on miss or expiry.
   */
  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      // PERF: Lazy expiry — delete on access, no background sweeper overhead
      this.store.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  /**
   * Set a value with a TTL in milliseconds.
   */
  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Invalidate a specific cache key.
   */
  invalidate(key: string): void {
    this.store.delete(key);
  }

  /**
   * Invalidate all keys starting with the given prefix.
   * PERF: Used for per-user cache busting after writes.
   * Example: invalidateByPrefix('progress:') clears all player progress entries.
   */
  invalidateByPrefix(prefix: string): void {
    let count = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        count++;
      }
    }
    if (count > 0) {
      this.logger.debug(`Invalidated ${count} cache entries with prefix "${prefix}"`);
    }
  }

  /**
   * Convenience: get from cache or execute a factory and cache the result.
   * PERF: Primary usage pattern — replaces boilerplate get/set around every DB call.
   *
   * Example:
   *   const config = await this.cache.getOrSet(
   *     'config:xp_multiplier',
   *     () => this.configRepo.findOne(...),
   *     60_000,
   *   );
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlMs: number,
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, ttlMs);
    return value;
  }

  /**
   * Returns the current number of live (non-expired) keys.
   * Useful for monitoring / health checks.
   */
  size(): number {
    const now = Date.now();
    let live = 0;
    for (const entry of this.store.values()) {
      if (entry.expiresAt > now) live++;
    }
    return live;
  }
}
