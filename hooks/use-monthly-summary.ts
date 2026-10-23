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

export function useMonthlySummary(): UseMonthlySummaryResult {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<YearMonth>(currentYearMonth);

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
        const month = me.isPremium ? selectedMonth : currentYearMonth();
        if (
          !me.isPremium &&
          (selectedMonth.year !== month.year || selectedMonth.month !== month.month)
        ) {
          setSelectedMonth(month);
        }
        try {
          const data = await getMonthlySummary(monthBoundsFor(month));
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
  }, [router, selectedMonth]);

  return {
    user: user,
    userName: user ? formatUserName(user) : undefined,
    summary,
    isLoading,
    error,
    selectedMonth,
    setSelectedMonth,
  };
}
