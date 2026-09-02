/**
 * A rolling-window counter held in module memory.
 *
 * **Deliberately not distributed.** Every serverless instance keeps its own map,
 * so a request that lands on a cold instance starts with an empty bucket and the
 * effective ceiling is the configured limit times the number of warm instances.
 * That is a real hole, and it is the right trade for what this guards: it stops
 * a naive script hammering one endpoint without adding a Redis dependency, an
 * external service, or a per-request network hop to a form that a boutique
 * studio receives a handful of times a week. If the threat ever becomes a
 * distributed one, this is the seam to swap for `@upstash/ratelimit` — the
 * signature is the same shape.
 */

const hits = new Map<string, number[]>();

/**
 * Above this many distinct keys, sweep expired entries. Bounds memory on an
 * instance that stays warm through a flood of unique addresses; the number is
 * far above any legitimate traffic this form will see.
 */
const SWEEP_THRESHOLD = 5000;

/**
 * Record an attempt against `key` and report whether it is within `limit` over
 * the trailing `windowMs`. Denied attempts still count, so sustained abuse keeps
 * the bucket full rather than refilling it the moment the attacker pauses.
 */
export function allow(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const cutoff = now - windowMs;

  if (hits.size > SWEEP_THRESHOLD) {
    // Approximate: entries are swept against the caller's window rather than
    // their own. Only memory is affected — every check below re-filters with the
    // window it was given, so an early sweep can never deny a legitimate call.
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
