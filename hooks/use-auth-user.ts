'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/api';
import { clearToken, getToken } from '@/lib/auth-storage';
import type { PublicUser } from '@/lib/types';

export interface UseAuthUserResult {
  user: PublicUser | null;
  /** "Förnamn Efternamn" eller undefined om ingen user */
  userName: string | undefined;
  isLoading: boolean;
  error: string | null;
}

export function formatUserName(user: PublicUser): string {
  return `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`;
}

export function useAuthUser(): UseAuthUserResult {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
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
        if (!cancelled) {
          setUser(me);
          setError(null);
        }
      } catch (err) {
        clearToken();
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Kunde inte ladda profil');
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

  return {
    user,
    userName: user ? formatUserName(user) : undefined,
    isLoading,
    error,
  };
}
