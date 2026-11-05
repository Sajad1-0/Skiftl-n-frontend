'use client';

import Link from 'next/link';
import { AuthRequired, PageError } from '@/components/feedback/page-error';
import { PageLoading } from '@/components/feedback/page-loading';
import { AppShell } from '@/components/layout/app-shell';
import { FadeIn } from '@/components/motion/fade-in';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CircularProgress } from '@/components/ui/circular-progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import StateCard from '@/components/state-card';
import { useMonthlySummary } from '@/hooks/use-monthly-summary';
import { formatKronor } from '@/lib/money';
import { MONTHLY_HOUR_TARGET } from '@/lib/shift-stats';
import { MonthPicker } from '@/components/history/month-picker';
import { formatYearMonthSv, monthBoundsFor, yearMonthKey } from '@/lib/month-bounds';
import { useState } from 'react';
import { downloadMonthlySummaryPdf, triggerBlobDownload } from '@/lib/api';

export default function MonthlySummaryPage() {
  const { user, userName, summary, isLoading, error, selectedMonth, setSelectedMonth } =
    useMonthlySummary();
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isPdfPending, setIsPdfPending] = useState(false);

  if (isLoading) {
    return <PageLoading label="Laddar sammanfattning…" />;
  }

  if (!user) {
    return <AuthRequired error={error} />;
  }

  const hours = summary ? summary.workedMinutes / 60 : 0;
  const hoursProgress = Math.min(100, Math.round((hours / MONTHLY_HOUR_TARGET) * 100));
  const goalProgress = summary?.goalProgressPercent ?? 0;
  const taxModeLabel = summary?.taxMode === 'table' ? 'Skattetabell' : 'Schablon (profil)';

  const stats = [
    { label: 'Pass', value: summary?.shiftCount ?? 0 },
    { label: 'Timmar', value: `${hours.toFixed(1)} h`, progress: hoursProgress },
    { label: 'Brutto', value: formatKronor(summary?.grossOre ?? 0) },
    ...(user.isPremium
      ? [{ label: 'Sjuklön', value: formatKronor(summary?.sickPayOre ?? 0) }]
      : []),
    { label: 'OB-tillägg', value: formatKronor(summary?.obOre ?? 0) },
    { label: 'Skatt', value: formatKronor(summary?.taxOre ?? 0) },
    { label: 'Netto', value: formatKronor(summary?.netOre ?? 0) },
  ];

  async function handleDownloadPdf() {
    if (isPdfPending) return;
    setPdfError(null);
    setIsPdfPending(true);
    try {
      const bounds = monthBoundsFor(selectedMonth);
      const blob = await downloadMonthlySummaryPdf(bounds);
      triggerBlobDownload(blob, `shiftkit-${yearMonthKey(selectedMonth)}.pdf`);
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : 'Kunde inte skapa PDF');
    } finally {
      setIsPdfPending(false);
    }
  }

  return (
    <AppShell userName={userName}>
      <FadeIn className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Månadssammanfattning</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Brutto, skatt ({taxModeLabel}) och netto — {formatYearMonthSv(selectedMonth)}
              {user.isPremium ? '' : ' · Gratis: schablon + bara innevarande månad'}
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-2 self-start">
            {user.isPremium ? (
              <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
            ) : null}
            {user.isPremium ? (
              <Button asChild variant="outline">
                <Link href="/summary/compare">Jämför månader</Link>
              </Button>
            ) : null}
            {user.isPremium ? (
              <Button
                type="button"
                variant="outline"
                disabled={isPdfPending}
                onClick={handleDownloadPdf}
              >
                {isPdfPending ? 'Skapar PDF…' : 'Ladda ner PDF'}
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link href="/premium">PDF (Premium)</Link>
              </Button>
            )}
            {user.isPremium ? (
              <Button asChild variant="outline">
                <Link href="/salary-goal">Redigera lönemål</Link>
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link href="/premium">Lönemål (Premium)</Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/tax-settings">Skatteinställningar</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/shifts">Visa pass</Link>
            </Button>
          </div>
        </div>
        {error ? <PageError message={error} variant="inline" /> : null}
        {pdfError ? <PageError message={pdfError} variant="inline" /> : null}
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-3">
          {stats.map((stat) => (
            <StateCard key={stat.label} {...stat} />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Per jobbprofil</CardTitle>
              <CardDescription>
                {summary?.taxMode === 'table'
                  ? 'Skatt och netto per profil är fördelat proportionellt från månadsskatt (tabell).'
                  : 'Skatt och netto beräknas med jobbprofilens schablonskatt (%).'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profil</TableHead>
                    <TableHead className="text-right">Pass</TableHead>
                    <TableHead className="text-right">Tid</TableHead>
                    <TableHead className="text-right">Skatt</TableHead>
                    <TableHead className="text-right">OB</TableHead>
                    <TableHead className="text-right">Brutto</TableHead>
                    <TableHead className="text-right">Netto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!summary || summary.byJobProfile.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-muted">
                        Inga pass denna månad.{' '}
                        <Link href="/shifts/new" className="underline underline-offset-4">
                          Logga ett pass
                        </Link>
                      </TableCell>
                    </TableRow>
                  ) : (
                    summary.byJobProfile.map((row) => (
                      <TableRow key={row.jobProfileId}>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell className="text-right tabular-nums">{row.shiftCount}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {(row.workedMinutes / 60).toFixed(1)} h
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatKronor(row.taxOre)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatKronor(row.obOre)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatKronor(row.grossOre)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatKronor(row.netOre)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="lg:row-span-2">
            <CardHeader>
              <CardTitle>Lönemål (netto)</CardTitle>
              <CardDescription>
                {summary?.goalOre != null ? formatKronor(summary.goalOre) : 'Inget mål satt ännu'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3 pb-6">
              <CircularProgress value={goalProgress} label="av mål" />
              <Badge variant="secondary">{user.isPremium ? 'Premium' : 'Standard'}</Badge>
              <p className="text-center text-sm text-muted-foreground">
                Progress räknas mot nettovinsten denna månad
              </p>
              {user.isPremium ? (
                <Button asChild variant="outline" size="sm">
                  <Link href="/salary-goal">Ändra mål</Link>
                </Button>
              ) : (
                <Button asChild variant="outline" size="sm">
                  <Link href="/premium">Sätt mål (Premium)</Link>
                </Button>
              )}
            </CardContent>
          </Card>
          {user.isPremium && (summary?.sickLeave?.length ?? 0) > 0 ? (
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                <div className="space-y-1.5">
                  <CardTitle>Sjukanmälan</CardTitle>
                  <CardDescription>Karensdag = 0 kr; övriga dagar 80 %</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/sick-leave">Hantera</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Profil</TableHead>
                      <TableHead>Karens</TableHead>
                      <TableHead className="text-right">Sjuklön</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary!.sickLeave.map((row) => (
                      <TableRow key={row.periodId}>
                        <TableCell className="tabular-nums">
                          {row.startDate} – {row.endDate}
                        </TableCell>
                        <TableCell>{row.profileName}</TableCell>
                        <TableCell className="tabular-nums">{row.karensdag ?? '—'}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatKronor(row.sickPayOre)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </FadeIn>
    </AppShell>
  );
}
