'use client';

import Link from 'next/link';
import { useTransition, useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PageError } from '@/components/feedback/page-error';
import { PageLoading } from '@/components/feedback/page-loading';
import { AppShell } from '@/components/layout/app-shell';
import { FadeIn } from '@/components/motion/fade-in';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { formatKronor } from '@/lib/money';
import { listJobProfiles, deleteShift } from '@/lib/api';
import type { PublicJobProfile } from '@/lib/types';
import { useMonthShiftStats } from '@/hooks/use-month-shift-stats';
import { MonthPicker } from '@/components/history/month-picker';
import { formatYearMonthSv } from '@/lib/month-bounds';

function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso));
}

export default function ShiftPage() {
  const {
    userName,
    user,
    shifts,
    stats,
    isLoading,
    error,
    setShifts,
    setError,
    reloadShifts,
    selectedMonth,
    setSelectedMonth,
  } = useMonthShiftStats();
  const [profiles, setProfiles] = useState<PublicJobProfile[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    void listJobProfiles()
      .then((data) => {
        if (!cancelled) setProfiles(data);
      })
      .catch(() => {
        /* profilnamn faller tillbaka till "Okänd profil" */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteShift(id);
        // Optimistiskt bort — sedan reload för uppdaterad est. netto
        setShifts((current) => current.filter((shift) => shift.id !== id));
        try {
          await reloadShifts();
        } catch (reloadErr) {
          setError(
            reloadErr instanceof Error
              ? reloadErr.message
              : 'Passet togs bort men listan kunde inte uppdateras',
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Kunde inte ta bort pass');
      }
    });
  }

  const profileName = (id: string) => profiles.find((p) => p.id === id)?.name ?? 'Okänd profil';

  if (isLoading) {
    return <PageLoading label="Laddar pass…" userName={userName} />;
  }

  return (
    <AppShell userName={userName}>
      <FadeIn className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Pass</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {stats.shiftCount} pass · {stats.hours.toFixed(1)} h ·{' '}
              {formatKronor(stats.totalGrossOre)} brutto
              {stats.totalObOre > 0 ? ` · ${formatKronor(stats.totalObOre)} OB` : ''}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
            {user?.isPremium ? (
              <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
            ) : (
              <p className="max-w-xs text-xs text-muted-foreground">
                Bara innevarande månad.{' '}
                <Link href="/premium" className="underline underline-offset-4">
                  Premium: 6 månader
                </Link>
              </p>
            )}
            <Button asChild className="gap-1.5 self-start">
              <Link href="/shifts/new">
                <Plus className="size-4" />
                Logga pass
              </Link>
            </Button>
          </div>
        </div>
        {error ? <PageError message={error} variant="inline" /> : null}
        <Card>
          <CardHeader>
            <CardTitle>{formatYearMonthSv(selectedMonth)}</CardTitle>
            <CardDescription>
              Est. netto = ungefärligt efter skatt (tabellmarginal eller schablon). Ändras om du
              lägger till/tar bort tidigare pass samma månad. Brutto är snapshot.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Start</TableHead>
                  <TableHead>Slut</TableHead>
                  <TableHead>Profil</TableHead>
                  <TableHead className="text-right">Tid</TableHead>
                  <TableHead className="text-right">OB</TableHead>
                  <TableHead className="text-right">Brutto</TableHead>
                  <TableHead className="text-right">Est. netto</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {shifts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                      Inga pass ännu.{' '}
                      <Link href="/shifts/new" className="underline underline-offset-4">
                        Logga ditt första
                      </Link>
                    </TableCell>
                  </TableRow>
                ) : (
                  shifts.map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell>{formatWhen(shift.startAt)}</TableCell>
                      <TableCell>{formatWhen(shift.endAt)}</TableCell>
                      <TableCell>{profileName(shift.jobProfileId)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {(shift.workedMinutes / 60).toFixed(1)} h
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatKronor(shift.obOre ?? 0)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatKronor(shift.grossOre)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {shift.estimatedNetOre != null ? formatKronor(shift.estimatedNetOre) : '—'}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={isPending}
                          onClick={() => handleDelete(shift.id)}
                          aria-label="Ta bort pass"
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
    </AppShell>
  );
}
