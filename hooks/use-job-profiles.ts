'use client';

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { listJobProfiles } from '@/lib/api';
import type { PublicJobProfile } from '@/lib/types';

export function primaryProfileId(profiles: PublicJobProfile[]): string {
  return profiles.find((p) => p.isPrimary)?.id ?? profiles[0]?.id ?? '';
}

export function profileNameById(profiles: PublicJobProfile[], id: string): string {
  return profiles.find((p) => p.id === id)?.name ?? 'Okänd profil';
}

interface UseJobProfilesOptions {
  /** false = hoppa över fetch (t.ex. innan auth / utan Premium) */
  enabled?: boolean;
  includeArchived?: boolean;
  /** Vid fel: tom lista, ingen error (t.ex. namnlookup i tabell) */
  softFail?: boolean;
}

export interface UseJobProfilesResult {
  profiles: PublicJobProfile[];
  setProfiles: Dispatch<SetStateAction<PublicJobProfile[]>>;
  isLoading: boolean;
  error: string | null;
  primaryId: string;
  reload: () => Promise<PublicJobProfile[]>;
}

export function useJobProfiles(options: UseJobProfilesOptions = {}): UseJobProfilesResult {
  const { enabled = true, includeArchived = false, softFail = false } = options;
  const [profiles, setProfiles] = useState<PublicJobProfile[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async (): Promise<PublicJobProfile[]> => {
    const list = await listJobProfiles({ includeArchived });
    setProfiles(list);
    setError(null);
    return list;
  }, [includeArchived]);

  useEffect(() => {
    if (!enabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    void listJobProfiles({ includeArchived })
      .then((list) => {
        if (!cancelled) {
          setProfiles(list);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setProfiles([]);
          setError(
            softFail ? null : err instanceof Error ? err.message : 'Kunde inte ladda jobbprofiler',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, includeArchived, softFail]);

  return {
    profiles,
    setProfiles,
    isLoading,
    error,
    primaryId: primaryProfileId(profiles),
    reload,
  };
}
