'use client';

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, listShifts } from '@/lib/api';
import { clearToken, getToken } from '@/lib/auth-storage';
import { monthBounds } from '@/lib/month-bounds';
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
  setShifts: Dispatch<SetStateAction<PublicShift[]>>;
  setError: Dispatch<SetStateAction<string | null>>;
}

export function useMonthShiftStats(): UseMonthShiftStatsResult {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [shifts, setShifts] = useState<PublicShift[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          const monthShifts = await listShifts(monthBounds());
          if (!cancelled) {
            setShifts(monthShifts);
            setError(null);
          }
        } catch (shiftError) {
          if (!cancelled) {
            setError(
              shiftError instanceof Error ? shiftError.message : 'Kunde inte ladda pass',
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
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const stats = summarizeShifts(shifts, user?.monthlySalaryGoal);

  return {
    user,
    userName: user ? formatUserName(user) : undefined,
    shifts,
    stats,
    isLoading,
    error,
    setShifts,
    setError,
  };
}
