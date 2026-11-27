'use client';

import type { Dispatch, SetStateAction } from 'react';
import { getMonthlySummary } from '@/lib/api';
import { monthBoundsFor, type YearMonth } from '@/lib/month-bounds';
import { useAuthUser } from '@/hooks/use-auth-user';
import { useMonthScopedFetch } from '@/hooks/use-month-scoped-fetch';
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

export function useMonthlySummary(): UseMonthlySummaryResult {
  const { user, userName, data, isLoading, error, selectedMonth, setSelectedMonth } =
    useMonthScopedFetch<MonthlySummary | null>({
      fetchMonth: (month) => getMonthlySummary(monthBoundsFor(month)),
      emptyValue: null,
      errorFallback: 'Kunde inte ladda sammanfattning',
    });

  return {
    user,
    userName,
    summary: data,
    isLoading,
    error,
    selectedMonth,
    setSelectedMonth,
  };
}
