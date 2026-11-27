// hooks/use-keyed-fetch.ts
'use client';

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';

export interface UseKeyedFetchOptions<T> {
  /** null = hämta inte (isLoading = false, data = emptyValue) */
  key: string | null;
  fetcher: (key: string) => Promise<T>;
  emptyValue: T;
  errorFallback: string;
}

export interface UseKeyedFetchResult<T> {
  data: T;
  isLoading: boolean;
  error: string | null;
  setData: Dispatch<SetStateAction<T>>;
  setError: Dispatch<SetStateAction<string | null>>;
  reload: () => Promise<void>;
}

/**
 * Generisk loadKey/loadedKey-fetch med cancel + synlig data bara när key matchar.
 */
export function useKeyedFetch<T>({
  key,
  fetcher,
  emptyValue,
  errorFallback,
}: UseKeyedFetchOptions<T>): UseKeyedFetchResult<T> {
  const [data, setData] = useState<T>(emptyValue);
  const [error, setError] = useState<string | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  const fetcherRef = useRef(fetcher);
  const emptyRef = useRef(emptyValue);
  const errorFallbackRef = useRef(errorFallback);

  useEffect(() => {
    fetcherRef.current = fetcher;
    emptyRef.current = emptyValue;
    errorFallbackRef.current = errorFallback;
  }, [fetcher, emptyValue, errorFallback]);

  const isLoading = key !== null && loadedKey !== key;
  const visibleData = key !== null && loadedKey === key ? data : emptyValue;

  async function reload(): Promise<void> {
    if (key == null) return;
    const next = await fetcherRef.current(key);
    setData(next);
    setError(null);
    setLoadedKey(key);
  }

  useEffect(() => {
    if (key == null) return;
    const activeKey = key;

    let cancelled = false;

    async function load() {
      try {
        const next = await fetcherRef.current(activeKey);
        if (!cancelled) {
          setData(next);
          setError(null);
          setLoadedKey(activeKey);
        }
      } catch (err) {
        if (!cancelled) {
          setData(emptyRef.current);
          setError(err instanceof Error ? err.message : errorFallbackRef.current);
          setLoadedKey(activeKey);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [key]);

  return {
    data: visibleData,
    isLoading,
    error,
    setData,
    setError,
    reload,
  };
}
