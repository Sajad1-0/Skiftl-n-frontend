'use client';

import Link from 'next/link';
import { Crown } from 'lucide-react';
import { FadeIn } from '../motion/fade-in';
import { PremiumFeatureList } from './premium-feature-list';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '../ui/card';
import type { PremiumFeatureId } from '@/lib/premium-features';
import { getPremiumFeature } from '@/lib/premium-features';

interface PremiumPaywallProps {
  featureId: PremiumFeatureId;
  detail?: string;
  backHref?: string;
  backLabel?: string;
  showFeatureList?: boolean;
}

export default function PremiumPaywall({
  featureId,
  detail,
  backHref = '/dashboard',
  backLabel = 'Tillbaka',
  showFeatureList = true,
}: PremiumPaywallProps) {
  const feature = getPremiumFeature(featureId);

  return (
    <FadeIn>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="size-5 text-primary" /> {feature.title}
          </CardTitle>
          <CardDescription>{detail ?? feature.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <p>Funktionen ingår i Premium. Uppgradera för att låsa upp den.</p>
          {showFeatureList ? <PremiumFeatureList highlightsIds={[featureId]} compact /> : null}
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/premium">Uppgradera till Premium</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={backHref}>{backLabel}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
}
