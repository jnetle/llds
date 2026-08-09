'use client';

import { useEffect, useLayoutEffect } from 'react';

/**
 * `useLayoutEffect` in the browser, `useEffect` on the server. Client components
 * still render once on the server, and a bare `useLayoutEffect` warns there —
 * but the layout-effect timing (DOM committed, nothing painted yet) is exactly
 * what a scroll compensation needs, so it cannot simply be downgraded.
 */
export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
