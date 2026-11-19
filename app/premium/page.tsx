'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, Crown } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { FadeIn } from '@/components/motion/fade-in';
import { AuthRequired, PageError } from '@/components/feedback/page-error';
import { PageLoading } from '@/components/feedback/page-loading';
import { PremiumFeatureList } from '@/components/premium/premium-feature-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthUser, formatUserName } from '@/hooks/use-auth-user';
import { useBillingActions } from '@/hooks/use-billing-actions';
import { BRAND_NAME } from '@/lib/brand';
import { formatPremiumBetaEndsAt } from '@/lib/premium-beta';

function PremiumPageContent() {
  const searchParams = useSearchParams();
  const { user, userName, isLoading, error: authError } = useAuthUser();
  const { isPending, error, startCheckout, openPortal } = useBillingActions();

  if (isLoading) {
    return <PageLoading label="Laddar Premium…" userName={userName} />;
  }

  if (!user) {
    return <AuthRequired error={authError} />;
  }

  const success = searchParams.get('success') === '1';
  const canceled = searchParams.get('canceled') === '1';
  const isBeta = user.premiumSource === 'beta';
  const betaEndsLabel =
    user.premiumBetaEndsAt != null ? formatPremiumBetaEndsAt(user.premiumBetaEndsAt) : null;

  const showPortal = user.hasStripeCustomer && (user.premiumSource === 'stripe' || isBeta);
  const showUpgrade = user.premiumSource === 'none';
  const showBetaCheckout = isBeta;

  const statusBadge = (() => {
    switch (user.premiumSource) {
      case 'beta':
        return 'Premium-beta';
      case 'stripe':
        return 'Aktiv';
      case 'bypass':
        return 'Premium';
      case 'none':
        return 'Gratisplan';
      default: {
        const _exhaustive: never = user.premiumSource;
        return _exhaustive;
      }
    }
  })();

  const title = (() => {
    switch (user.premiumSource) {
      case 'beta':
        return 'Premium-beta';
      case 'stripe':
      case 'bypass':
        return 'Du har Premium';
      case 'none':
        return 'Uppgradera';
      default: {
        const _exhaustive: never = user.premiumSource;
        return _exhaustive;
      }
    }
  })();

  const description = (() => {
    switch (user.premiumSource) {
      case 'beta':
        return betaEndsLabel
          ? `Alla Premium-funktioner är öppna till ${betaEndsLabel}. Därefter behövs Stripe-abonnemang (eller gratisplan).`
          : 'Alla Premium-funktioner är öppna under beta.';
      case 'stripe':
        return 'Alla Premium-funktioner är upplåsta. Om du avslutar i Stripe behåller du Premium till periodens slut (oftast resten av månaden).';
      case 'bypass':
        return 'Alla Premium-funktioner är upplåsta på det här kontot.';
      case 'none':
        return 'Betala månadsvis. Avsluta när som helst via Stripe-portalen.';
      default: {
        const _exhaustive: never = user.premiumSource;
        return _exhaustive;
      }
    }
  })();

  return (
    <AppShell userName={formatUserName(user)}>
      <FadeIn className="mx-auto flex w-full max-w-lg flex-col gap-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Premium</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isBeta
                ? `Tidsbegränsad beta för ${BRAND_NAME} — synligt slutdatum, inget krav på kort.`
                : `Månadsabonnemang via Stripe för ${BRAND_NAME}. Avsluta när som helst.`}
            </p>
          </div>
          <Badge variant="secondary" className="self-start">
            {statusBadge}
          </Badge>
        </div>

        {error ? <PageError message={error} variant="inline" /> : null}

        {success ? (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Tack! Premium aktiveras när Stripe bekräftat betalningen (oftast inom några sekunder).
            Ladda om sidan om statusen inte uppdaterats.
          </div>
        ) : null}

        {canceled ? (
          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            Checkout avbruten — du kan försöka igen när du vill.
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Vad ingår</CardTitle>
              <CardDescription>
                Allt i Gratisplan plus Premium-funktionerna nedan. OB-regler ingår redan gratis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PremiumFeatureList />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="size-5 text-primary" />
                {title}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  Historik, bulk, sjuk, PDF, lönemål
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  Skattetabell + exakta raster
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {isBeta ? 'Beta utan kort — Stripe valfritt' : 'Avsluta via Stripe-portalen'}
                </li>
              </ul>

              {showPortal ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => void openPortal()}
                >
                  {isPending ? 'Öppnar...' : 'Hantera abonnemang'}
                </Button>
              ) : null}

              {showUpgrade ? (
                <Button type="button" disabled={isPending} onClick={() => void startCheckout()}>
                  {isPending ? 'Öppnar Stripe…' : 'Uppgradera med Stripe'}
                </Button>
              ) : null}

              {showBetaCheckout ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => void startCheckout()}
                >
                  {isPending ? 'Öppnar Stripe…' : 'Säkra Premium efter beta'}
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </FadeIn>
    </AppShell>
  );
}

export default function PremiumPage() {
  return (
    <Suspense fallback={<PageLoading label="Laddar Premium..." />}>
      <PremiumPageContent />
    </Suspense>
  );
}
