'use client';

import Link from 'next/link';
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

export default function MonthlySummaryPage() {
  const { user, userName, summary, isLoading, error } = useMonthlySummary();

  if (isLoading) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">Laddar Sammanfattning</p>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col justify-center gap-4 px-4 py-12">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Link href="/login" className="text-sm font-medium underline-offset-4 hover:underline">
          Logga in
        </Link>
      </main>
    );
  }

  const hours = summary ? summary.workedMinutes / 60 : 0;
  const hoursProgress = Math.min(100, Math.round((hours / MONTHLY_HOUR_TARGET) * 100));
  const goalProgress = summary?.goalProgressPercent ?? 0;

  const stats = [
    { label: 'Pass', value: summary?.shiftCount ?? 0 },
    { label: 'Timmar', value: `${hours.toFixed(1)} h`, progress: hoursProgress },
    { label: 'Brutto', value: formatKronor(summary?.grossOre ?? 0) },
    { label: 'OB-tillägg', value: formatKronor(summary?.obOre ?? 0) },
    { label: 'Netto', value: formatKronor(summary?.netOre ?? 0) },
  ] as const;

  return (
    <AppShell userName={userName}>
      <FadeIn className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Månadssammanfattning</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Brutto, netto och fördelning per jobbprofil denna månad
            </p>
          </div>
          <Button asChild variant="outline" className="self-start">
            <Link href="/shifts">Visa pass</Link>
          </Button>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat) => (
            <StateCard key={stat.label} {...stat} />
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Per jobbprofil</CardTitle>
              <CardDescription>Skatt och netto beräknas per profil</CardDescription>
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
                        <TableCell className="text-right tabular-nums">{row.taxRate}%</TableCell>
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

          <Card>
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
            </CardContent>
          </Card>
        </div>
      </FadeIn>
    </AppShell>
  );
}
