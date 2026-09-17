'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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
import { deleteShift, getCurrentUser, listJobProfiles, listShifts } from '@/lib/api';
import { clearToken, getToken } from '@/lib/auth-storage';
import { formatKronor } from '@/lib/money';
import type { PublicJobProfile, PublicShift, PublicUser } from '@/lib/types';

function monthBounds(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const ymd = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { from: ymd(from), to: ymd(to) };
}

function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso));
}

export default function ShiftPage() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [profiles, setProfile] = useState<PublicJobProfile[]>([]);
  const [shifts, setShifts] = useState<PublicShift[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!getToken) {
        router.replace('/login');
        return;
      }

      try {
        const bounds = monthBounds();
        const [me, data, jobProfiles] = await Promise.all([
          getCurrentUser(),
          listShifts(bounds),
          listJobProfiles(),
        ]);
        if (!cancelled) {
          setUser(me);
          setShifts(data);
          setProfile(jobProfiles);
        }
      } catch (err) {
        clearToken();
        if (!cancelled) setError(err instanceof Error ? err.message : 'Kunde inte ladda pass');
        router.replace('/login');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteShift(id);
        setShifts((cur) => cur.filter((s) => s.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Kunde inte ta bort pass');
      }
    });
  }

  const profileName = (id: string) => profiles.find((p) => p.id === id)?.name ?? 'Okänd profil';

  const userName = user
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`
    : undefined;

  if (isLoading) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">Laddar pass…</p>
      </AppShell>
    );
  }

  return (
    <AppShell userName={userName}>
      <FadeIn className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Pass</h1>
            <p className="mt-1 text-sm text-muted-foreground">Dina arbtespass denna månad</p>
          </div>
          <Button asChild className="gap-1.5 self-start">
            <Link href="/shifts/new">
              <Plus className="size-4" />
              Logga pass
            </Link>
          </Button>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Card>
          <CardHeader>
            <CardTitle>Denna månad</CardTitle>
            <CardDescription>
              Brutto räknas från jobbprofilens timlön (öre → kronor i UI)
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
                  <TableHead className="text-right">Brutto</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {shifts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
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
                        {formatKronor(shift.grossOre)}
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
