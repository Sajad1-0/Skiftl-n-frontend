'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { AuthRequired, PageError } from '@/components/feedback/page-error';
import { PageLoading } from '@/components/feedback/page-loading';
import { FadeIn } from '@/components/motion/fade-in';
import { MonthPicker } from '@/components/history/month-picker';
import { PremiumFeatureGate } from '@/components/premium/premium-feature-gate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useMonthScopedFetch } from '@/hooks/use-month-scoped-fetch';
import { profileNameById, useJobProfiles } from '@/hooks/use-job-profiles';
import { deleteSickLeave, listSickLeave } from '@/lib/api';
import { formatYearMonthSv, monthBoundsFor } from '@/lib/month-bounds';
import { formatKronor } from '@/lib/money';
import type { PublicSickLeave } from '@/lib/types';

const EMPTY_PERIODS: PublicSickLeave[] = [];

export default function SickLeavePage() {
  const {
    user,
    userName,
    data: periods,
    isLoading,
    error,
    selectedMonth,
    setSelectedMonth,
    setData: setPeriods,
    setError,
  } = useMonthScopedFetch<PublicSickLeave[]>({
    fetchMonth: (month) => listSickLeave(monthBoundsFor(month)),
    emptyValue: EMPTY_PERIODS,
    errorFallback: 'Kunde inte ladda sjukanmälningar',
    requirePremium: true,
  });

  const { profiles } = useJobProfiles({ enabled: !!user?.isPremium, softFail: true });
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!window.confirm('Ta bort denna sjukperiod?')) return;
    startTransition(async () => {
      try {
        await deleteSickLeave(id);
        setPeriods((current) => current.filter((p) => p.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Kunde inte ta bort');
      }
    });
  }

  if (isLoading) {
    return <PageLoading label="Laddar sjukanmälan…" userName={userName} />;
  }
  if (!user) return <AuthRequired />;

  return (
    <PremiumFeatureGate
      isPremium={user.isPremium}
      userName={userName}
      featureId="sick"
      backHref="/shifts"
      backLabel="Tillbaka till pass"
    >
      <FadeIn className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Sjukanmälan</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Första arbetsdagen = karens (0kr). Övriga = 80% av timlön * timmar -{' '}
              {formatYearMonthSv(selectedMonth)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <MonthPicker compact value={selectedMonth} onChange={setSelectedMonth} />
            <Button asChild className="gap-1.5">
              <Link href="/sick-leave/new">
                <Plus className="size-4" />
                Ny period
              </Link>
            </Button>
          </div>
        </div>

        {error ? <PageError message={error} variant="inline" /> : null}

        <Card>
          <CardHeader>
            <CardTitle>Perioder</CardTitle>
            <CardDescription>
              Sjuklön beräknas från pass på vald jobbprofil inom perioden.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Profil</TableHead>
                  <TableHead>Karensdag</TableHead>
                  <TableHead className="text-right">Sjuklön</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      Inga sjukanmälningar.{' '}
                      <Link href="/sick-leave/new" className="underline underline-offset-4">
                        Skapa en period
                      </Link>
                    </TableCell>
                  </TableRow>
                ) : (
                  periods.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="tabular-nums">
                        {p.startDate} – {p.endDate}
                      </TableCell>
                      <TableCell>{profileNameById(profiles, p.jobProfileId)}</TableCell>
                      <TableCell className="tabular-nums">{p.karensdag ?? '—'}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatKronor(p.totalSickPayOre)}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={isPending}
                          aria-label="Ta bort"
                          onClick={() => handleDelete(p.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </FadeIn>
    </PremiumFeatureGate>
  );
}
