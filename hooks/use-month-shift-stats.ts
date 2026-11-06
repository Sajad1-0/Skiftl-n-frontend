'use client';

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { listShifts } from '@/lib/api';
import { currentYearMonth, monthBoundsFor, type YearMonth } from '@/lib/month-bounds';
import { summarizeShifts, type ShiftMonthStats } from '@/lib/shift-stats';
import { useAuthUser } from '@/hooks/use-auth-user';
import type { PublicShift } from '@/lib/types';

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

function monthKey(month: YearMonth): string {
  return `${month.year}-${month.month}`;
}

export function useMonthShiftStats(): UseMonthShiftStatsResult {
  const { user, userName, isLoading: authLoading, error: authError } = useAuthUser();
  const [shifts, setShifts] = useState<PublicShift[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<YearMonth>(currentYearMonth);
  const loadKey = monthKey(selectedMonth);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const dataLoading = !!user && loadedKey !== loadKey;
  const isLoading = authLoading || dataLoading;
  const visibleShifts = loadedKey === loadKey ? shifts : [];

  async function reloadShifts(): Promise<void> {
    const month = user?.isPremium ? selectedMonth : currentYearMonth();
    const monthShifts = await listShifts(monthBoundsFor(month));
    setShifts(monthShifts);
    setLoadedKey(monthKey(month));
    setError(null);
  }

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
        const monthShifts = await listShifts(monthBoundsFor(month));
        if (!cancelled) {
          setShifts(monthShifts);
          setError(null);
          setLoadedKey(monthKey(month));
        }
      } catch (shiftError) {
        if (!cancelled) {
          setShifts([]);
          setError(shiftError instanceof Error ? shiftError.message : 'Kunde inte ladda pass');
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
    shifts: visibleShifts,
    stats: summarizeShifts(visibleShifts, user?.monthlySalaryGoal),
    isLoading,
    error: error ?? authError,
    selectedMonth,
    setSelectedMonth,
    setShifts,
    setError,
    reloadShifts,
  };
}
