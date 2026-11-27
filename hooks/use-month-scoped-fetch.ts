/* eslint-disable react-hooks/refs */
'use client';

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { useAuthUser } from '@/hooks/use-auth-user';
import { useKeyedFetch } from '@/hooks/use-keyed-fetch';
import { currentYearMonth, yearMonthKey, type YearMonth } from '@/lib/month-bounds';

export interface UseMonthScopedFetchOptions<T> {
  fetchMonth: (month: YearMonth) => Promise<T>;
  emptyValue: T;
  errorFallback: string;
  /** Bara hämta när user.isPremium (t.ex. sjukanmälan). Default false. */
  requirePremium?: boolean;
  /** Lås free till innevarande månad. Default true. */
  clampFreeToCurrentMonth?: boolean;
}

export interface UseMonthScopedFetchResult<T> {
  user: ReturnType<typeof useAuthUser>['user'];
  userName: string | undefined;
  data: T;
  isLoading: boolean;
  error: string | null;
  selectedMonth: YearMonth;
  setSelectedMonth: Dispatch<SetStateAction<YearMonth>>;
  setData: Dispatch<SetStateAction<T>>;
  setError: Dispatch<SetStateAction<string | null>>;
  reload: () => Promise<void>;
}

/**
 * Månadsstyrd fetch med auth, free-clamp och loadKey/loadedKey via useKeyedFetch.
 */
export function useMonthScopedFetch<T>({
  fetchMonth,
  emptyValue,
  errorFallback,
  requirePremium = false,
  clampFreeToCurrentMonth = true,
}: UseMonthScopedFetchOptions<T>): UseMonthScopedFetchResult<T> {
  const { user, userName, isLoading: authLoading, error: authError } = useAuthUser();
  const [selectedMonth, setSelectedMonth] = useState<YearMonth>(currentYearMonth);

  useEffect(() => {
    if (!user || user.isPremium || !clampFreeToCurrentMonth || requirePremium) return;
    const current = currentYearMonth();
    if (selectedMonth.year !== current.year || selectedMonth.month !== current.month) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedMonth(current);
    }
  }, [user, selectedMonth, clampFreeToCurrentMonth, requirePremium]);

  const monthForFetch =
    user && !user.isPremium && clampFreeToCurrentMonth && !requirePremium
      ? currentYearMonth()
      : selectedMonth;

  const shouldFetch =
    !!user &&
    (!requirePremium || user.isPremium) &&
    !(
      !user.isPremium &&
      clampFreeToCurrentMonth &&
      !requirePremium &&
      (selectedMonth.year !== monthForFetch.year || selectedMonth.month !== monthForFetch.month)
    );

  const key = shouldFetch
    ? requirePremium
      ? `${user.id}:${yearMonthKey(monthForFetch)}`
      : yearMonthKey(monthForFetch)
    : null;

  const monthRef = useRef(monthForFetch);
  monthRef.current = monthForFetch;
  const fetchRef = useRef(fetchMonth);
  fetchRef.current = fetchMonth;

  const keyed = useKeyedFetch({
    key,
    fetcher: async () => fetchRef.current(monthRef.current),
    emptyValue,
    errorFallback,
  });

  return {
    user,
    userName,
    data: keyed.data,
    isLoading: authLoading || keyed.isLoading,
    error: keyed.error ?? authError,
    selectedMonth,
    setSelectedMonth,
    setData: keyed.setData,
    setError: keyed.setError,
    reload: keyed.reload,
  };
}
