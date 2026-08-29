'use client';

import { useEffect, useState, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders children ONLY on the client after hydration.
 * Use this to wrap any component that uses localStorage, geolocation,
 * Date.now(), or any other browser-only API to prevent hydration mismatches.
 */
export default function ClientOnly({ children, fallback = null }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <>{children}</> : <>{fallback}</>;
}
