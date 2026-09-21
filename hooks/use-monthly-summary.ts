'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getMonthlySummary } from '@/lib/api';
import { clearToken, getToken } from '@/lib/auth-storage';
import { monthBounds } from '@/lib/month-bounds';
import { formatUserName } from './use-auth-user';
import type { MonthlySummary, PublicUser } from '@/lib/types';

export interface UseMonthlySummaryResult {
  user: PublicUser | null;
  userName: string | undefined;
  summary: MonthlySummary | null;
  isLoading: boolean;
  error: string | null;
}

export function useMonthlySummary(): UseMonthlySummaryResult {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!getToken()) {
        router.replace('/login');
        if (!cancelled) setIsLoading(false);
        return;
      }

      try {
        const me = await getCurrentUser();
        if (cancelled) return;
        setUser(me);

        try {
          const data = await getMonthlySummary(monthBounds());
          if (!cancelled) {
            setSummary(data);
            setError(null);
          }
        } catch (summaryError) {
          if (!cancelled) {
            setError(
              summaryError instanceof Error
                ? summaryError.message
                : 'Kunde inte ladda sammanfattning',
            );
          }
        }
      } catch (authError) {
        clearToken();
        if (!cancelled) {
          setError(authError instanceof Error ? authError.message : 'Kunde inte ladda data');
        }
        router.replace('/login');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return {
    user: user,
    userName: user ? formatUserName(user) : undefined,
    summary,
    isLoading,
    error,
  };
}
