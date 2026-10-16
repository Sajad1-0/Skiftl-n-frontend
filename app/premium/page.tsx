'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Crown } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { FadeIn } from '@/components/motion/fade-in';
import { AuthRequired, PageError } from '@/components/feedback/page-error';
import { PageLoading } from '@/components/feedback/page-loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createBillingCheckout, createBillingPortal, getCurrentUser } from '@/lib/api';
import { clearToken, getToken } from '@/lib/auth-storage';
import { formatUserName } from '@/hooks/use-auth-user';
import type { PublicUser } from '@/lib/types';

export default function PremiumPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!getToken()) {
        router.replace('/login');
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
          setError(err instanceof Error ? err.message : 'Kunde inte ladda');
        }
        router.replace('/login');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  function handleUpgrade() {
    startTransition(async () => {
      try {
        const { url } = await createBillingCheckout();
        window.location.href = url;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Checkout misslyckades');
      }
    });
  }

  function handlePortal() {
    startTransition(async () => {
      try {
        const { url } = await createBillingPortal();
        window.location.href = url;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Portal misslyckades');
      }
    });
  }

  if (isLoading) {
    return (
      <PageLoading label="Laddar Premium…" userName={user ? formatUserName(user) : undefined} />
    );
  }

  if (!user) {
    return <AuthRequired error={error} />;
  }

  const success = searchParams.get('success') === '1';
  const canceled = searchParams.get('canceled') === '1';
  const showPortal = user.isPremium && user.hasStripeCustomer;
  const showUpgrade = !user.isPremium;

  return (
    <AppShell userName={formatUserName(user)}>
      <FadeIn className="mx-auto flex w-full max-w-lg flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Premium</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Månadsabonnemang via Stripe. Historik, bulk-logg, skattetabell m.m.
          </p>
        </div>

        {error ? <PageError message={error} variant="inline" /> : null}
        {success ? (
          <p className="text-sm text-green-700">
            Tack! Premium aktiveras när Stripe bekräftat betalningen.
          </p>
        ) : null}
        {canceled ? (
          <p className="text-sm text-muted-foreground">
            Checkout avbruten — du kan försöka igen när du vill.
          </p>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="size-5 text-primary" />
              {user.isPremium ? 'Du har Premium' : 'Uppgradera'}
            </CardTitle>
            <CardDescription>
              {user.isPremium
                ? user.hasStripeCustomer
                  ? 'Alla Premium-funktioner är upplåsta. Hantera betalning via Stripe-portalen.'
                  : 'Alla Premium-funktioner är upplåsta på det här kontot.'
                : 'Betala månadsvis. Avsluta när som helst via Stripe-portalen.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {showPortal ? (
              <Button type="button" variant="outline" disabled={isPending} onClick={handlePortal}>
                Hantera abonnemang
              </Button>
            ) : null}
            {showUpgrade ? (
              <Button type="button" disabled={isPending} onClick={handleUpgrade}>
                Uppgradera med Stripe
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </FadeIn>
    </AppShell>
  );
}
