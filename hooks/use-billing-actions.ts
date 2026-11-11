'use client';

import { useState } from 'react';
import { createBillingCheckout, createBillingPortal } from '@/lib/api';

interface BillingActions {
  isPending: boolean;
  error: string | null;
  startCheckout: () => Promise<void>;
  openPortal: () => Promise<void>;
  clearError: () => void;
}

export function useBillingActions(): BillingActions {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(): Promise<void> {
    if (isPending) return;
    setError(null);
    setIsPending(true);

    try {
      const { url } = await createBillingCheckout();
      window.location.href = url;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Checkout misslyckades');
      setIsPending(false);
    }
  }

  async function openPortal(): Promise<void> {
    if (isPending) return;
    setError(null);
    setIsPending(true);
    try {
      const { url } = await createBillingPortal();
      window.location.href = url;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Portal misslyckades');
      setIsPending(false);
    }
  }

  return {
    isPending,
    error,
    startCheckout,
    openPortal,
    clearError: () => setError(null),
  };
}
