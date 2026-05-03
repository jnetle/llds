'use client';

import { useEffect, useState } from 'react';

export function useCompact(maxWidth = 1024) {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const onChange = () => setIsCompact(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [maxWidth]);

  return isCompact;
}

export function useCols(maxWidth = 1024) {
  const compact = useCompact(maxWidth);
  return (desktop: string) => (compact ? '1fr' : desktop);
}
