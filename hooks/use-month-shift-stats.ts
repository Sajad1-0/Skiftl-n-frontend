'use client';

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, listShifts } from '@/lib/api';
import { clearToken, getToken } from '@/lib/auth-storage';
import { currentYearMonth, monthBoundsFor, type YearMonth } from '@/lib/month-bounds';
import { summarizeShifts, type ShiftMonthStats } from '@/lib/shift-stats';
import { formatUserName } from '@/hooks/use-auth-user';
import type { PublicShift, PublicUser } from '@/lib/types';

export interface UseMonthShiftStatsResult {
  user: PublicUser | null;
  userName: string | undefined;
  shifts: PublicShift[];
  stats: ShiftMonthStats;
  isLoading: boolean;
  error: string | null;
  selectedMonth: YearMonth;
  setSelectedMonth: Dispatch<SetStateAction<YearMonth>>;
  setShifts: Dispatch<SetStateAction<PublicShift[]>>;
  setError: Dispatch<SetStateAction<string | null>>;
  /** Ladda om månadens pass (t.ex. efter delete så est. netto uppdateras). */
  reloadShifts: () => Promise<void>;
}

function monthKey(month: YearMonth): string {
  return `${month.year}-${month.month}`;
}

export function useMonthShiftStats(): UseMonthShiftStatsResult {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [shifts, setShifts] = useState<PublicShift[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<YearMonth>(currentYearMonth);
  const loadKey = monthKey(selectedMonth);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const isLoading = loadedKey !== loadKey;
  const visibleShifts = loadedKey === loadKey ? shifts : [];

  async function reloadShifts(): Promise<void> {
    const month = user?.isPremium ? selectedMonth : currentYearMonth();
    const monthShifts = await listShifts(monthBoundsFor(month));
    setShifts(monthShifts);
    setLoadedKey(monthKey(month));
    setError(null);
  }

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

        // Free: Lås till innevarande månad
        const month = me.isPremium ? selectedMonth : currentYearMonth();
        if (
          !me.isPremium &&
          (selectedMonth.year !== month.year || selectedMonth.month !== month.month)
        ) {
          setSelectedMonth(month);
          return;
        }

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
      } catch (authError) {
        clearToken();
        if (!cancelled) {
          setShifts([]);
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

  const stats = summarizeShifts(visibleShifts, user?.monthlySalaryGoal);

  return {
    user,
    userName: user ? formatUserName(user) : undefined,
    shifts: visibleShifts,
    stats,
    isLoading,
    error,
    selectedMonth,
    setSelectedMonth,
    setShifts,
    setError,
    reloadShifts,
  };
}
