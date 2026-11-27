'use client';

import type { Dispatch, SetStateAction } from 'react';
import { listShifts } from '@/lib/api';
import { monthBoundsFor, type YearMonth } from '@/lib/month-bounds';
import { summarizeShifts, type ShiftMonthStats } from '@/lib/shift-stats';
import { useAuthUser } from '@/hooks/use-auth-user';
import { useMonthScopedFetch } from '@/hooks/use-month-scoped-fetch';
import type { PublicShift } from '@/lib/types';

const EMPTY_SHIFTS: PublicShift[] = [];

export interface UseMonthShiftStatsResult {
  user: ReturnType<typeof useAuthUser>['user'];
  userName: string | undefined;
  shifts: PublicShift[];
  stats: ShiftMonthStats;
  isLoading: boolean;
  error: string | null;
  selectedMonth: YearMonth;
  setSelectedMonth: Dispatch<SetStateAction<YearMonth>>;
  setShifts: Dispatch<SetStateAction<PublicShift[]>>;
  setError: Dispatch<SetStateAction<string | null>>;
  reloadShifts: () => Promise<void>;
}

export function useMonthShiftStats(): UseMonthShiftStatsResult {
  const {
    user,
    userName,
    data: shifts,
    isLoading,
    error,
    selectedMonth,
    setSelectedMonth,
    setData: setShifts,
    setError,
    reload,
  } = useMonthScopedFetch<PublicShift[]>({
    fetchMonth: (month) => listShifts(monthBoundsFor(month)),
    emptyValue: EMPTY_SHIFTS,
    errorFallback: 'Kunde inte ladda pass',
  });

  return {
    user,
    userName,
    shifts,
    stats: summarizeShifts(shifts, user?.monthlySalaryGoal),
    isLoading,
    error,
    selectedMonth,
    setSelectedMonth,
    setShifts,
    setError,
    reloadShifts: reload,
  };
}
