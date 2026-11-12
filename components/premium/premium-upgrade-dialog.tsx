'use client';

import { Crown } from 'lucide-react';
import { PageError } from '@/components/feedback/page-error';
import { PremiumFeatureList } from '@/components/premium/premium-feature-list';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useBillingActions } from '@/hooks/use-billing-actions';
import type { PremiumFeatureId } from '@/lib/premium-features';
import { getPremiumFeature } from '@/lib/premium-features';

interface PremiumUpgradeDialogProps {
  featureId?: PremiumFeatureId;
  triggerLabel?: string;
  triggerVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
  triggerSize?: 'default' | 'sm' | 'lg';
  triggerClassName?: string;
  /** Visa Crown-ikon på trigger (default: false för link, true annars). */
  showTriggerIcon?: boolean;
  children?: React.ReactNode;
}

export default function PremiumUpgradeDialog({
  featureId,
  triggerLabel = 'Uppgradera',
  triggerVariant = 'outline',
  triggerSize = 'default',
  triggerClassName,
  showTriggerIcon,
  children,
}: PremiumUpgradeDialogProps) {
  const { isPending, error, startCheckout, clearError } = useBillingActions();
  const feature = featureId ? getPremiumFeature(featureId) : null;
  const withIcon = showTriggerIcon ?? triggerVariant !== 'link';

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) clearError();
      }}
    >
      <DialogTrigger asChild>
        {children ?? (
          <Button
            type="button"
            variant={triggerVariant}
            size={triggerSize}
            className={triggerClassName}
          >
            {withIcon ? <Crown className="size-4" /> : null}
            {triggerLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="size-5 text-primary" />
            {feature ? feature.title : 'Uppgradera till Premium'}
          </DialogTitle>
          <DialogDescription>
            {feature
              ? `${feature.description} Ingår i månadsabonnemanget via Stripe.`
              : 'Lås upp historik, bulk-logg, sjuk, PDF, lönemål och mer.'}
          </DialogDescription>
        </DialogHeader>

        <PremiumFeatureList
          highlightsIds={featureId ? [featureId] : undefined}
          compact={Boolean(featureId)}
        />

        {error ? <PageError message={error} variant="inline" /> : null}

        <DialogFooter>
          <Button type="button" disabled={isPending} onClick={() => void startCheckout()}>
            {isPending ? 'Öppnar Stripe…' : 'Fortsätt till Stripe'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
