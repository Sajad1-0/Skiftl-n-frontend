'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { FadeIn } from '@/components/motion/fade-in';
import { Badge } from '@/components/ui/badge';
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
import { useAuthUser } from '@/hooks/use-auth-user';
import { deleteJobProfile, listJobProfiles, listCollectiveAgreements } from '@/lib/api';
import { formatKronor } from '@/lib/money';
import type { PublicAgreement, PublicJobProfile } from '@/lib/types';

export default function JobProfilesPage() {
  const { user, userName, isLoading: authLoading, error: authError } = useAuthUser();
  const [profiles, setProfiles] = useState<PublicJobProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [agreements, setAgreements] = useState<PublicAgreement[]>([]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function load() {
      try {
        const profileData = await listJobProfiles();
        if (!cancelled) {
          setProfiles(profileData);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Kunde inte ladda profiler');
        }
      } finally {
        if (!cancelled) setProfilesLoading(false);
      }

      try {
        const agreementData = await listCollectiveAgreements();
        if (!cancelled) setAgreements(agreementData);
      } catch {
        if (!cancelled) setAgreements([]);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const agreementName = (id: string | null) =>
    id ? (agreements.find((a) => a.id === id)?.name ?? 'Okänt avtal') : '—';

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteJobProfile(id);
        setProfiles((current) => current.filter((profile) => profile.id !== id));
      } catch (deleteError) {
        setError(deleteError instanceof Error ? deleteError.message : 'Kunde inte ta bort profil');
      }
    });
  }

  const isLoading = authLoading || (!!user && profilesLoading);
  const displayError = error ?? authError;

  if (isLoading) {
    return (
      <AppShell userName={userName}>
        <p className="text-sm text-muted-foreground">Laddar jobbprofiler…</p>
      </AppShell>
    );
  }

  return (
    <AppShell userName={userName}>
      <FadeIn className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Jobbprofiler</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Hantera jobbprofiler, timlön och skattesats. Gratisplan: max en profil.
            </p>
          </div>
          <Button asChild size="lg" className="h-10 gap-1.5 self-start">
            <Link href="/job-profiles/new">
              <Plus className="size-4" />
              Skapa profil
            </Link>
          </Button>
        </div>

        {displayError ? (
          <p
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {displayError}
          </p>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Dina profiler</CardTitle>
              <CardDescription>{profiles.length} sparade</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Namn</TableHead>
                    <TableHead>Timlön</TableHead>
                    <TableHead>Skatt</TableHead>
                    <TableHead>Arbetsgivare</TableHead>
                    <TableHead>Avtal</TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                        Ingen jobbprofil ännu.{' '}
                        <Link
                          href="/job-profiles/new"
                          className="font-medium text-foreground underline underline-offset-4"
                        >
                          Skapa din första
                        </Link>
                      </TableCell>
                    </TableRow>
                  ) : (
                    profiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">
                          <span className="inline-flex items-center gap-2">
                            {profile.name}
                            {profile.isPrimary ? <Badge variant="secondary">Primär</Badge> : null}
                          </span>
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {formatKronor(profile.hourlyWage)}
                        </TableCell>
                        <TableCell className="tabular-nums">{profile.taxRate}%</TableCell>
                        <TableCell className="text-muted-foreground">
                          {profile.employerName ?? '—'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {agreementName(profile.collectiveAgreementId)}
                        </TableCell>
                        <TableCell>
                          <Button
                            asChild
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Redigera ${profile.name}`}
                          >
                            <Link href={`/job-profiles/${profile.id}/edit`}>
                              <Pencil className="size-4" />
                            </Link>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            disabled={isPending}
                            onClick={() => handleDelete(profile.id)}
                            aria-label={`Ta bort ${profile.name}`}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Skapa jobbprofil</CardTitle>
              <CardDescription>Lägg till timlön och skatt för ett jobb.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Formuläret finns på en egen sida så validering och API-anrop hålls enkla.
              </p>
              <Button asChild className="w-full" size="lg">
                <Link href="/job-profiles/new">Öppna formulär</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </FadeIn>
    </AppShell>
  );
}
