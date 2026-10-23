'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AuthRequired, PageError } from '@/components/feedback/page-error';
import { PageLoading } from '@/components/feedback/page-loading';
import { AppShell } from '@/components/layout/app-shell';
import { FadeIn } from '@/components/motion/fade-in';
import { MonthPicker } from '@/components/history/month-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthUser } from '@/hooks/use-auth-user';
import { getMonthlySummary } from '@/lib/api';
import {
  currentYearMonth,
  formatYearMonthSv,
  listSelectableMonths,
  monthBoundsFor,
  type YearMonth,
} from '@/lib/month-bounds';
import { formatKronor } from '@/lib/money';
import type { MonthlySummary } from '@/lib/types';

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
          <span>{formatKronor(summary?.taxOre ?? 0)}</span>
        </div>
        <div className="flex justify-between font-medium">
          <span>Netto</span>
          <span>{formatKronor(summary?.netOre ?? 0)}</span>
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
  const [summaryA, setSummaryA] = useState<MonthlySummary | null>(null);
  const [summaryB, setSummaryB] = useState<MonthlySummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loadKey = `${monthA.year}-${monthA.month}_${monthB.year}-${monthB.month}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loading = user?.isPremium === true && loadedKey !== loadKey;

  useEffect(() => {
    if (!user?.isPremium) return;

    let cancelled = false;

    async function load() {
      try {
        const [a, b] = await Promise.all([
          getMonthlySummary(monthBoundsFor(monthA)),
          getMonthlySummary(monthBoundsFor(monthB)),
        ]);
        if (!cancelled) {
          setSummaryA(a);
          setSummaryB(b);
          setError(null);
          setLoadedKey(loadKey);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Kunde inte jämföra');
          setLoadedKey(loadKey);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [user, monthA, monthB, loadKey]);

  if (authLoading || loading) {
    return <PageLoading label="Laddar jämförelse..." userName={userName} />;
  }

  if (!user) {
    return <AuthRequired />;
  }

  if (!user.isPremium) {
    return (
      <AppShell userName={userName}>
        <FadeIn className="mx-auto max-w-lg space-y-4">
          <h1 className="text-2xl font-semibold">Jämför månader</h1>
          <p className="text-sm text-muted-foreground">
            Jämförelse av två månader ingår i Premium (senaste 6 månaderna).
          </p>
          <Button asChild>
            <Link href="/premium">Uppgradera</Link>
          </Button>
        </FadeIn>
      </AppShell>
    );
  }

  const deltaNet = (summaryB?.netOre ?? 0) - (summaryA?.netOre ?? 0);

  return (
    <AppShell userName={userName}>
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
            {deltaNet >= 0 ? '+' : ''}
            {formatKronor(deltaNet)}
          </CardContent>
        </Card>
      </FadeIn>
    </AppShell>
  );
}
