'use client';

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getMonthlySummary } from '@/lib/api';
import { clearToken, getToken } from '@/lib/auth-storage';
import { currentYearMonth, monthBoundsFor, type YearMonth } from '@/lib/month-bounds';
import { formatUserName } from './use-auth-user';
import type { MonthlySummary, PublicUser } from '@/lib/types';

export interface UseMonthlySummaryResult {
  user: PublicUser | null;
  userName: string | undefined;
  summary: MonthlySummary | null;
  isLoading: boolean;
  error: string | null;
  selectedMonth: YearMonth;
  setSelectedMonth: Dispatch<SetStateAction<YearMonth>>;
}

function monthKey(month: YearMonth): string {
  return `${month.year}-${month.month}`;
}

export function useMonthlySummary(): UseMonthlySummaryResult {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<YearMonth>(currentYearMonth);
  const loadKey = monthKey(selectedMonth);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const isLoading = loadedKey !== loadKey;
  const visibleSummary = loadedKey === loadKey ? summary : null;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!getToken()) {
        router.replace('/login');
        if (!cancelled) setLoadedKey(loadKey);
        return;
      }

      try {
        const me = await getCurrentUser();
        if (cancelled) return;
        setUser(me);

        const month = me.isPremium ? selectedMonth : currentYearMonth();
        if (
          !me.isPremium &&
          (selectedMonth.year !== month.year || selectedMonth.month !== month.month)
        ) {
          setSelectedMonth(month);
          return;
        }

        try {
          const data = await getMonthlySummary(monthBoundsFor(month));
          if (!cancelled) {
            setSummary(data);
            setError(null);
            setLoadedKey(monthKey(month));
          }
        } catch (summaryError) {
          if (!cancelled) {
            setSummary(null);
            setError(
              summaryError instanceof Error
                ? summaryError.message
                : 'Kunde inte ladda sammanfattning',
            );
            setLoadedKey(monthKey(month));
          }
        }
      } catch (authError) {
        clearToken();
        if (!cancelled) {
          setSummary(null);
          setError(authError instanceof Error ? authError.message : 'Kunde inte ladda data');
          setLoadedKey(loadKey);
        }
        router.replace('/login');
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [router, selectedMonth, loadKey]);

  return {
    user,
    userName: user ? formatUserName(user) : undefined,
    summary: visibleSummary,
    isLoading,
    error,
    selectedMonth,
    setSelectedMonth,
  };
}
