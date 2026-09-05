'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { getCurrentUser } from '@/app/lib/api';
import { clearToken, getToken } from '@/app/lib/auth-storage';
import type { PublicUser } from '@/app/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      if (!getToken()) {
        router.replace('/login');
        return;
      }

      try {
        const me = await getCurrentUser();
        if (!cancelled) {
          setUser(me);
        }
      } catch (error) {
        clearToken();
        if (!cancelled) {
          setError(error instanceof Error ? error.message : 'Kunde inte ladda profil');
        }
        router.replace('/login');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }
    void loadUser();
    return () => {
      cancelled = true;
    };
  }, [router]);

  function handleLogout() {
    startTransition(() => {
      clearToken();
      router.push('/login');
    });
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-full w-full max-w-lg flex-1 items-center justify-center px-4 py-12">
        <p className="text-sm text-foreground/70">Laddar dashboard…</p>
      </main>
    );
  }
  if (!user) {
    return (
      <main className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col justify-center gap-4 px-4 py-12">
        {error ? <p className="text-sm text-red-600 dark:text-red-300">{error}</p> : null}
        <Link href="/login" className="text-sm font-medium underline-offset-4 hover:underline">
          Logga in
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-sm text-foreground/70">Inloggad via JWT mot Skiftlön API.</p>

      <section className="mt-8 space-y-2 rounded-lg border border-foreground/10 p-4">
        <p className="text-base font-medium">
          {user.firstName}
          {user.lastName ? ` ${user.lastName}` : ''}
        </p>
        <p className="text-sm text-foreground/80">{user.email}</p>
        <p className="text-sm text-foreground/70">Premium: {user.isPremium ? 'Ja' : 'Nej'}</p>
      </section>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isPending}
          className="rounded-md border border-foreground/20 px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {isPending ? 'Loggar ut…' : 'Logga ut'}
        </button>
        <Link href="/" className="text-sm text-foreground/70 underline-offset-4 hover:underline">
          Hem
        </Link>
      </div>
    </main>
  );
}
