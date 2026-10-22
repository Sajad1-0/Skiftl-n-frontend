'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { Archive, ArchiveRestore, Crown, Plus, Trash2, Pencil } from 'lucide-react';
import { PageError } from '@/components/feedback/page-error';
import { PageLoading } from '@/components/feedback/page-loading';
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
import {
  archiveJobProfile,
  deleteJobProfile,
  listJobProfiles,
  listCollectiveAgreements,
  unarchiveJobProfile,
} from '@/lib/api';
import { formatKronor } from '@/lib/money';
import type { PublicAgreement, PublicJobProfile } from '@/lib/types';

const FREE_CAP = 1;
const PREMIUM_CAP = 5;

export default function JobProfilesPage() {
  const { user, userName, isLoading: authLoading, error: authError } = useAuthUser();
  const [profiles, setProfiles] = useState<PublicJobProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [agreements, setAgreements] = useState<PublicAgreement[]>([]);

  const isPremium = user?.isPremium === true;

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function load() {
      try {
        const profileData = await listJobProfiles({
          includeArchived: user?.isPremium === true,
        });
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

  const activeProfiles = profiles.filter((p) => p.archivedAt == null);
  const activeCount = activeProfiles.length;
  const cap = isPremium ? PREMIUM_CAP : FREE_CAP;
  const canCreate = activeCount < cap;
  const canArchive = activeCount > 1;

  function reloadProfiles() {
    return listJobProfiles({ includeArchived: isPremium }).then(setProfiles);
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteJobProfile(id);
        setProfiles((current) => current.filter((profile) => profile.id !== id));
        setError(null);
      } catch (deleteError) {
        setError(deleteError instanceof Error ? deleteError.message : 'Kunde inte ta bort profil');
      }
    });
  }

  function handleArchive(id: string) {
    startTransition(async () => {
      try {
        await archiveJobProfile(id);
        await reloadProfiles();
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Kunde inte arkivera profil');
      }
    });
  }

  function handleUnarchive(id: string) {
    startTransition(async () => {
      try {
        await unarchiveJobProfile(id);
        await reloadProfiles();
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Kunde inte återställa profil');
      }
    });
  }

  const isLoading = authLoading || (!!user && profilesLoading);
  const displayError = error ?? authError;

  if (isLoading) {
    return <PageLoading label="Laddar jobbprofiler…" userName={userName} />;
  }

  return (
    <AppShell userName={userName}>
      <FadeIn className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Jobbprofiler</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isPremium
                ? `Premium: ${activeCount}/${PREMIUM_CAP} aktiva profiler. Arkiverade syns nedan.`
                : `Gratisplan: ${activeCount}/${FREE_CAP} aktiv profil. Uppgradera för upp till ${PREMIUM_CAP}.`}
            </p>
          </div>
          {canCreate ? (
            <Button asChild size="lg" className="h-10 gap-1.5 self-start">
              <Link href="/job-profiles/new">
                <Plus className="size-4" />
                Skapa profil
              </Link>
            </Button>
          ) : isPremium ? (
            <Button type="button" size="lg" variant="outline" className="h-10 self-start" disabled>
              Max {PREMIUM_CAP} aktiva — arkivera en
            </Button>
          ) : (
            <Button asChild size="lg" variant="outline" className="h-10 gap-1.5 self-start">
              <Link href="/premium">
                <Crown className="size-4" />
                Uppgradera för fler
              </Link>
            </Button>
          )}
        </div>

        {displayError ? <PageError message={displayError} /> : null}

        <div className="grid gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Dina profiler</CardTitle>
              <CardDescription>
                {activeCount} aktiva
                {isPremium && profiles.length > activeCount
                  ? ` · ${profiles.length - activeCount} arkiverade`
                  : null}
              </CardDescription>
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
                    <TableHead className="w-28" />
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
                    profiles.map((profile) => {
                      const archived = profile.archivedAt != null;
                      return (
                        <TableRow
                          key={profile.id}
                          className={archived ? 'opacity-60' : undefined}
                        >
                          <TableCell className="font-medium">
                            <span className="inline-flex flex-wrap items-center gap-2">
                              {profile.name}
                              {profile.isPrimary && !archived ? (
                                <Badge variant="secondary">Primär</Badge>
                              ) : null}
                              {archived ? <Badge variant="outline">Arkiverad</Badge> : null}
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
                            <div className="flex items-center justify-end gap-0.5">
                              {!archived ? (
                                <>
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
                                  {canArchive ? (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-sm"
                                      disabled={isPending}
                                      onClick={() => handleArchive(profile.id)}
                                      aria-label={`Arkivera ${profile.name}`}
                                    >
                                      <Archive className="size-4" />
                                    </Button>
                                  ) : null}
                                </>
                              ) : isPremium ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  disabled={isPending || activeCount >= PREMIUM_CAP}
                                  onClick={() => handleUnarchive(profile.id)}
                                  aria-label={`Återställ ${profile.name}`}
                                >
                                  <ArchiveRestore className="size-4" />
                                </Button>
                              ) : null}
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
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Skapa jobbprofil</CardTitle>
              <CardDescription>
                {canCreate
                  ? 'Lägg till timlön och skatt för ett jobb.'
                  : isPremium
                    ? 'Du har nått max 5 aktiva. Arkivera en profil för att skapa ny.'
                    : 'Gratisplan tillåter en profil. Uppgradera till Premium för fler.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {canCreate ? (
                <Button asChild className="w-full" size="lg">
                  <Link href="/job-profiles/new">Öppna formulär</Link>
                </Button>
              ) : isPremium ? (
                <Button type="button" className="w-full" size="lg" variant="outline" disabled>
                  Max {PREMIUM_CAP} aktiva — arkivera en
                </Button>
              ) : (
                <Button asChild className="w-full gap-1.5" size="lg" variant="outline">
                  <Link href="/premium">
                    <Crown className="size-4" />
                    Uppgradera till Premium
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </FadeIn>
    </AppShell>
  );
}
