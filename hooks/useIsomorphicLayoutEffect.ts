'use client';

import { useEffect, useLayoutEffect } from 'react';

/**
 /**
  * `useLayoutEffect` in the browser, `useEffect` on the server, where a bare `useLayoutEffect` warns. It cannot
  * simply be downgraded: the layout-effect timing — DOM committed, nothing painted — is what scroll compensation needs.
  */
export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
