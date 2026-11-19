// components/premium/premium-beta-banner.tsx
'use client';

import Link from 'next/link';
import { Crown } from 'lucide-react';
import { formatPremiumBetaEndsAt } from '@/lib/premium-beta';

interface PremiumBetaBannerProps {
  endsAtIso: string;
}

export function PremiumBetaBanner({ endsAtIso }: PremiumBetaBannerProps) {
  const endsLabel = formatPremiumBetaEndsAt(endsAtIso);

  return (
    <div className="border-b border-primary/20 bg-primary/5 px-4 py-2.5 text-sm text-foreground">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
        <p className="flex items-start gap-2">
          <Crown className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <span>
            <span className="font-medium">Premium-beta</span>
            {' — '}
            alla Premium-funktioner är öppna till{' '}
            <time dateTime={endsAtIso}>{endsLabel}</time>. Därefter gäller gratisplan eller
            Stripe-abonnemang.
          </span>
        </p>
        <Link
          href="/premium"
          className="shrink-0 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Läs mer
        </Link>
      </div>
    </div>
  );
}
