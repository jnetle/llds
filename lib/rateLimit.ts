/**
 * A rolling-window counter held in module memory.
 *
 * Deliberately not distributed: each serverless instance keeps its own map, so the real ceiling is `limit` times the
 * warm-instance count. Accepted trade — it stops naive scripts without a Redis dependency on a form that sees a handful
 * of submissions a week. Swap for `@upstash/ratelimit` if the threat becomes distributed; `allow()` has the same shape.
 */

const hits = new Map<string, number[]>();

/** Sweep expired entries above this many keys, to bound memory on a long-warm instance. */
const SWEEP_THRESHOLD = 5000;

/**
 * Record an attempt against `key` and report whether it is within `limit` over the trailing `windowMs`.
 * Denied attempts still count, so sustained abuse keeps the bucket full rather than refilling it during a pause.
 */
export function allow(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const cutoff = now - windowMs;

  if (hits.size > SWEEP_THRESHOLD) {
    // Sweeps against the caller's window rather than each entry's own. Affects memory only — every check below
    // re-filters with the window it was given, so an early sweep can never deny a legitimate call.
    for (const [k, times] of hits) {
      const kept = times.filter(t => t > cutoff);
      if (kept.length === 0) hits.delete(k);
      else hits.set(k, kept);
    }
  }

  const recent = (hits.get(key) ?? []).filter(t => t > cutoff);

  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }

  recent.push(now);
  hits.set(key, recent);
  return true;
}

/** Drop all state. Tests only. */
export function resetRateLimits(): void {
  hits.clear();
}
