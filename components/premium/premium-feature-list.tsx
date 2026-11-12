import { Check } from 'lucide-react';
import { PREMIUM_FEATURES, type PremiumFeatureId } from '@/lib/premium-features';
import { cn } from '@/lib/utils';

interface PremiumFeatureListProps {
  // Visa bara vissa featuers (t.ex. i dialog). Tom = all.
  highlightsIds?: PremiumFeatureId[];
  compact?: boolean;
  className?: string;
}

export function PremiumFeatureList({
  highlightsIds,
  compact = false,
  className,
}: PremiumFeatureListProps) {
  const features = highlightsIds?.length
    ? PREMIUM_FEATURES.filter((f) => highlightsIds.includes(f.id))
    : PREMIUM_FEATURES;

  return (
    <ul className={cn('space-y-3', className)}>
      {features.map((feature) => (
        <li key={feature.id} className="flex gap-3">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Check className="size-3.5" />
          </span>
          <div className="min-w-0">
            <p className={cn('font-medium text-foreground', compact ? 'text-sm' : 'text-sm')}>
              {feature.title}
            </p>
            {!compact ? (
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
