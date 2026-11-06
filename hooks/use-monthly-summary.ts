'use client';

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { getMonthlySummary } from '@/lib/api';
import { currentYearMonth, monthBoundsFor, type YearMonth } from '@/lib/month-bounds';
import { useAuthUser } from '@/hooks/use-auth-user';
import type { MonthlySummary } from '@/lib/types';

export interface UseMonthlySummaryResult {
  user: ReturnType<typeof useAuthUser>['user'];
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
  const { user, userName, isLoading: authLoading, error: authError } = useAuthUser();
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<YearMonth>(currentYearMonth);
  const loadKey = monthKey(selectedMonth);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const dataLoading = !!user && loadedKey !== loadKey;
  const isLoading = authLoading || dataLoading;
  const visibleSummary = loadedKey === loadKey ? summary : null;

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    const month = user.isPremium ? selectedMonth : currentYearMonth();

    if (
      !user.isPremium &&
      (selectedMonth.year !== month.year || selectedMonth.month !== month.month)
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedMonth(month);
      return;
    }

    async function load() {
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
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [user, selectedMonth, loadKey]);

  return {
    user,
    userName,
    summary: visibleSummary,
    isLoading,
    error: error ?? authError,
    selectedMonth,
    setSelectedMonth,
  };
}
