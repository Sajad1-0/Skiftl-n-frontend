'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
import { getCurrentUser } from '@/lib/api';
import { clearToken, getToken } from '@/lib/auth-storage';
import { formatKronor } from '@/lib/money';
import type { PublicUser } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      if (!getToken()) {
        router.replace('/login');
        return;
      }

      try {
        const me = await getCurrentUser();
        if (!cancelled) {
          setUser(me);
        }
      } catch (loadError) {
        clearToken();
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Kunde inte ladda profil');
        }
        router.replace('/login');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }
    void loadUser();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (isLoading) {
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
  const goalOre = user.monthlySalaryGoal;
  // Progress kopplas till skift-API när det finns
  const goalProgress = 0;

  return (
    <AppShell userName={`${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`}>
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
            <Link href="/job-profiles">
              <Plus className="size-4" />
              Jobbprofiler
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <div>
                <CardTitle>Månadsöversikt</CardTitle>
                <CardDescription>Timmar och beräknad lön (kommer med skift-API)</CardDescription>
              </div>
              <Badge variant="secondary">{user.isPremium ? 'Premium' : 'Gratis'}</Badge>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">0 av 160 timmar</span>
                  <span className="font-medium tabular-nums">0%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-0 rounded-full bg-primary transition-all" />
                </div>
              </div>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Beräknad lön</p>
                  <p className="text-2xl font-semibold tabular-nums">{formatKronor(0)}</p>
                </div>
                <Button asChild variant="outline">
                  <Link href="/job-profiles">
                    <Clock className="size-4" />
                    Förbered jobbprofil
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lönemål</CardTitle>
              <CardDescription>
                {goalOre ? formatKronor(goalOre) : 'Inget mål satt ännu'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3 pb-6">
              <CircularProgress value={goalProgress} label="av mål" />
              <p className="text-sm text-muted-foreground">
                Progress syns när du loggat skift.
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
                    <TableHead>Jobbprofil</TableHead>
                    <TableHead className="text-right">Belopp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                      Inga skift ännu. Skiftloggning kommer i nästa steg.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </FadeIn>
      </FadeIn>
    </AppShell>
  );
}
