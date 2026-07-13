'use client';

import { useEffect, useState } from 'react';

// Mirrors the matchMedia pattern in useCompact. Returns true when the user has
// asked the OS to reduce motion, so callers can skip non-essential transitions.
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
