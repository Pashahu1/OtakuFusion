'use client';

import { useEffect, useState, type ReactNode } from 'react';

interface DeferredMountProps {
  children: ReactNode;
  fallback?: ReactNode;
  /** Extra delay after idle — useful to yield right after hero paint. */
  delayMs?: number;
}

/** Mount children after the browser is idle so hero/LCP work is not blocked. */
export function DeferredMount({ children, fallback = null, delayMs = 0 }: DeferredMountProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let idleId: number | undefined;

    const mount = () => {
      if (delayMs > 0) {
        timeoutId = setTimeout(() => setIsMounted(true), delayMs);
        return;
      }
      setIsMounted(true);
    };

    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(mount, { timeout: 2_000 });
    } else {
      timeoutId = setTimeout(mount, 1);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (idleId !== undefined && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
    };
  }, [delayMs]);

  return isMounted ? children : fallback;
}
