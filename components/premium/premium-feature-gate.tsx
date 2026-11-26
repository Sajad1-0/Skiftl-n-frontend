'use client';

import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import PremiumPaywall from '@/components/premium/premium-paywall';
import type { PremiumFeatureId } from '@/lib/premium-features';

interface PremiumFeatureGateProps {
  isPremium: boolean;
  userName?: string | null;
  featureId: PremiumFeatureId;
  detail?: string;
  backHref?: string;
  backLabel?: string;
  showFeatureList?: boolean;
  children: ReactNode;
}

/**
 * Page-level Premium gate: AppShell + paywall, eller AppShell + children.
 * Använd efter auth/loading-checks när hela sidan kräver Premium.
 */
export function PremiumFeatureGate({
  isPremium,
  userName,
  featureId,
  detail,
  backHref,
  backLabel,
  showFeatureList,
  children,
}: PremiumFeatureGateProps) {
  const shellName = userName ?? undefined;

  if (!isPremium) {
    return (
      <AppShell userName={shellName}>
        <PremiumPaywall
          featureId={featureId}
          detail={detail}
          backHref={backHref}
          backLabel={backLabel}
          showFeatureList={showFeatureList}
        />
      </AppShell>
    );
  }

  return <AppShell userName={shellName}>{children}</AppShell>;
}
