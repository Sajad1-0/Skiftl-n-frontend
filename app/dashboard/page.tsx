'use client';

import Link from 'next/link';
import { Clock, Plus } from 'lucide-react';
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
import { useMonthShiftStats } from '@/hooks/use-month-shift-stats';
import { useMonthlySummary } from '@/hooks/use-monthly-summary';
import { formatKronor } from '@/lib/money';
import { MONTHLY_HOUR_TARGET } from '@/lib/shift-stats';

export default function DashboardPage() {
  const { user, userName, shifts, stats, isLoading, error } = useMonthShiftStats();
  const { summary, isLoading: summaryLoading, error: summaryError } = useMonthlySummary();

  if (isLoading || summaryLoading) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">Laddar dashboard…</p>
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

  const displayName = user.firstName;
  const goalOre = summary?.goalOre ?? user.monthlySalaryGoal;
  const hoursProgress = Math.min(100, Math.round((stats.hours / MONTHLY_HOUR_TARGET) * 100));
  const goalProgress = summary?.goalProgressPercent ?? 0;

  const recentShifts = [...shifts]
    .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())
    .slice(0, 5);

  return (
    <AppShell userName={userName}>
      <FadeIn className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Välkommen tillbaka, {displayName}!
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Översikt över din arbetstid och lön den här månaden.
            </p>
          </div>
          <Button asChild size="lg" className="h-10 gap-1.5 self-start sm:self-auto">
            <Link href="/shifts/new">
              <Plus className="size-4" />
              Logga pass
            </Link>
          </Button>
        </div>

        {summaryError ? (
          <p className="text-sm text-destructive" role="alert">
            {summaryError}{' '}
            <Link href="/summary" className="underline underline-offset-4">
              Öppna sammanfattning
            </Link>
          </p>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <div>
                <CardTitle>Månadsöversikt</CardTitle>
                <CardDescription>Timmar och beräknad bruttolön denna månad</CardDescription>
              </div>
              <Badge variant="secondary">{user.isPremium ? 'Premium' : 'Gratis'}</Badge>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {stats.hours.toFixed(1)} av {MONTHLY_HOUR_TARGET} timmar
                  </span>
                  <span className="font-medium tabular-nums">{hoursProgress}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${hoursProgress}%` }}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Beräknad lön (brutto)</p>
                  <p className="text-2xl font-semibold tabular-nums">
                    {summary ? formatKronor(summary.grossOre) : '—'}
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link href="/summary">
                    <Clock className="size-4" />
                    Visa sammanfattning
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Lönemål (netto)</CardTitle>
              <CardDescription>
                {goalOre ? formatKronor(goalOre) : 'Inget mål satt ännu'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3 pb-6">
              <CircularProgress value={goalProgress} label="av mål" />
              <p className="text-sm text-muted-foreground">Beräknad lön (netto)</p>
              <p className="text-2xl font-semibold tabular-nums">
                {summary ? formatKronor(summary.netOre) : '—'}
              </p>
            </CardContent>
          </Card>
        </div>
        <FadeIn delayMs={80}>
          <Card>
            <CardHeader>
              <CardTitle>Senaste skift</CardTitle>
              <CardDescription>Dina senaste registrerade pass</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Anteckning</TableHead>
                    <TableHead>Tid</TableHead>
                    <TableHead className="text-right">Belopp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentShifts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                        Inga skift ännu.{' '}
                        <Link href="/shifts/new" className="underline underline-offset-4">
                          Logga ditt första
                        </Link>
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentShifts.map((shift) => (
                      <TableRow key={shift.id}>
                        <TableCell>{shift.notes ?? '—'}</TableCell>
                        <TableCell className="tabular-nums">
                          {(shift.workedMinutes / 60).toFixed(1)} h
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatKronor(shift.grossOre)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </FadeIn>
      </FadeIn>
    </AppShell>
  );
}
