'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { AuthRequired, PageError } from '@/components/feedback/page-error';
import { PageLoading } from '@/components/feedback/page-loading';
import { FadeIn } from '@/components/motion/fade-in';
import { MonthPicker } from '@/components/history/month-picker';
import { PremiumFeatureGate } from '@/components/premium/premium-feature-gate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthUser } from '@/hooks/use-auth-user';
import { useKeyedFetch } from '@/hooks/use-keyed-fetch';
import { getMonthlySummary } from '@/lib/api';
import {
  currentYearMonth,
  formatYearMonthSv,
  listSelectableMonths,
  monthBoundsFor,
  yearMonthKey,
  type YearMonth,
} from '@/lib/month-bounds';
import { formatKronor, formatOptionalKronor } from '@/lib/money';
import type { MonthlySummary } from '@/lib/types';

interface CompareSummaries {
  summaryA: MonthlySummary | null;
  summaryB: MonthlySummary | null;
}

const EMPTY_COMPARE: CompareSummaries = { summaryA: null, summaryB: null };

function SummaryColumn({ title, summary }: { title: string; summary: MonthlySummary | null }) {
  const hours = summary ? summary.workedMinutes / 60 : 0;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{summary ? `${summary.shiftCount} pass` : '-'}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm tabular-nums">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Timmar</span>
          <span>{hours.toFixed(1)} h</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Brutto</span>
          <span>{formatKronor(summary?.grossOre ?? 0)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">OB</span>
          <span>{formatKronor(summary?.obOre ?? 0)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Skatt</span>
          <span>{formatOptionalKronor(summary?.taxOre)}</span>
        </div>
        <div className="flex justify-between font-medium">
          <span>Netto</span>
          <span>{formatOptionalKronor(summary?.netOre)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CompareMonthPage() {
  const { user, userName, isLoading: authLoading } = useAuthUser();
  const months = listSelectableMonths();
  const [monthA, setMonthA] = useState<YearMonth>(months[1] ?? currentYearMonth());
  const [monthB, setMonthB] = useState<YearMonth>(months[0] ?? currentYearMonth());

  const monthsRef = useRef({ monthA, monthB });
  // eslint-disable-next-line react-hooks/refs
  monthsRef.current = { monthA, monthB };

  const loadKey = user?.isPremium ? `${yearMonthKey(monthA)}_${yearMonthKey(monthB)}` : null;

  const {
    data,
    isLoading: dataLoading,
    error,
  } = useKeyedFetch<CompareSummaries>({
    key: loadKey,
    fetcher: async () => {
      const { monthA: a, monthB: b } = monthsRef.current;
      const [summaryA, summaryB] = await Promise.all([
        getMonthlySummary(monthBoundsFor(a)),
        getMonthlySummary(monthBoundsFor(b)),
      ]);
      return { summaryA, summaryB };
    },
    emptyValue: EMPTY_COMPARE,
    errorFallback: 'Kunde inte jämföra',
  });

  if (authLoading || dataLoading) {
    return <PageLoading label="Laddar jämförelse..." userName={userName} />;
  }

  if (!user) {
    return <AuthRequired />;
  }

  const { summaryA, summaryB } = data;
  const deltaNet =
    summaryA?.netOre != null && summaryB?.netOre != null ? summaryB.netOre - summaryA.netOre : null;

  return (
    <PremiumFeatureGate
      isPremium={user.isPremium}
      userName={userName}
      featureId="history"
      detail="Jämförelse av två månader ingår i Premium (senaste 6 månaderna)."
      backHref="/summary"
      backLabel="Tillbaka till sammanfattning"
    >
      <FadeIn className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Jämför månader</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Välj två månader inom de senaste 6.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/summary">Tillbaka</Link>
          </Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <MonthPicker id="month-a" label="Månad A" value={monthA} onChange={setMonthA} />
          <MonthPicker id="month-b" label="Månad B" value={monthB} onChange={setMonthB} />
        </div>
        {error ? <PageError message={error} variant="inline" /> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <SummaryColumn title={formatYearMonthSv(monthA)} summary={summaryA} />
          <SummaryColumn title={formatYearMonthSv(monthB)} summary={summaryB} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Differens (B − A)</CardTitle>
            <CardDescription>Netto</CardDescription>
          </CardHeader>
          <CardContent className="text-lg font-semibold tabular-nums">
            {deltaNet == null ? '—' : `${deltaNet >= 0 ? '+' : ''}${formatKronor(deltaNet)}`}
          </CardContent>
        </Card>
      </FadeIn>
    </PremiumFeatureGate>
  );
}
