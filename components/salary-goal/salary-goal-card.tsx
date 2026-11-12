import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CircularProgress } from '@/components/ui/circular-progress';
import { formatHoursToGoal } from '@/lib/goal-hours';
import { formatKronor } from '@/lib/money';
import { cn } from '@/lib/utils';
import PremiumUpgradeDialog from '../premium/premium-upgrade-dialog';

export interface SalaryGoalSummaryFields {
  goalOre: number | null;
  goalProgressPercent: number;
  goalRemainingOre: number | null;
  hoursToGoalEstimate: number | null;
  netOre: number;
}

interface SalaryGoalCardProps {
  summary: SalaryGoalSummaryFields | null;
  isPremium: boolean;
  showNetAmount?: boolean;
  showPremiumBadge?: boolean;
  footnote?: string;
  /** t.ex. "denna månad" eller "mars 2026" */
  periodLabel?: string;
  progressCaption?: string;
  className?: string;
}

export function SalaryGoalCard({
  summary,
  isPremium,
  showNetAmount = false,
  showPremiumBadge = false,
  footnote,
  periodLabel = 'denna månad',
  progressCaption,
  className,
}: SalaryGoalCardProps) {
  const displayedGoalOre = isPremium ? (summary?.goalOre ?? null) : null;
  const progress = isPremium ? (summary?.goalProgressPercent ?? 0) : 0;

  const hoursToGoalLabel =
    isPremium && summary?.goalOre != null
      ? formatHoursToGoal(
          {
            goalOre: summary.goalOre,
            goalRemainingOre: summary.goalRemainingOre,
            hoursToGoalEstimate: summary.hoursToGoalEstimate,
          },
          { periodLabel },
        )
      : null;

  const showEstimateHint =
    isPremium &&
    summary?.hoursToGoalEstimate != null &&
    summary.goalRemainingOre != null &&
    summary.goalRemainingOre > 0;

  const caption =
    progressCaption ??
    (!showNetAmount ? `Progress räknas mot nettovinsten ${periodLabel}` : undefined);

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Lönemål (netto)</CardTitle>
        <CardDescription>
          {displayedGoalOre != null ? formatKronor(displayedGoalOre) : 'Inget mål satt ännu'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3 pb-6">
        <CircularProgress value={progress} label="av mål" />
        {showPremiumBadge ? (
          <Badge variant="secondary">{isPremium ? 'Premium' : 'Standard'}</Badge>
        ) : null}
        {showNetAmount ? (
          <>
            <p className="text-sm text-muted-foreground">Beräknad lön (netto)</p>
            <p className="text-2xl font-semibold tabular-nums">
              {summary ? formatKronor(summary.netOre) : '—'}
            </p>
          </>
        ) : null}
        {caption ? <p className="text-center text-sm text-muted-foreground">{caption}</p> : null}
        {hoursToGoalLabel ? (
          <p className="text-center text-sm font-medium text-foreground">{hoursToGoalLabel}</p>
        ) : null}
        {showEstimateHint && footnote ? (
          <p className="text-center text-xs text-muted-foreground">{footnote}</p>
        ) : null}
        {isPremium ? (
          <Button asChild variant="outline" size="sm">
            <Link href="/salary-goal">Ändra mål</Link>
          </Button>
        ) : (
          <PremiumUpgradeDialog
            featureId="goal"
            triggerLabel="Sätt mål (Premium)"
            triggerVariant="outline"
            triggerSize="sm"
          />
        )}
      </CardContent>
    </Card>
  );
}
