'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { AuthRequired, PageError } from '@/components/feedback/page-error';
import { PageLoading } from '@/components/feedback/page-loading';
import { AppShell } from '@/components/layout/app-shell';
import { FadeIn } from '@/components/motion/fade-in';
import BreakIntervalsEditor, {
  draftsToBreakIntervals,
  hasIncompleteBreakDrafts,
  type BreakIntervalDraft,
} from '@/components/shifts/break-intervals-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthUser } from '@/hooks/use-auth-user';
import { createBulkShifts, listJobProfiles } from '@/lib/api';
import type { BulkCreateShiftsBody, PublicJobProfile } from '@/lib/types';

const MAX_ROWS = 10;

interface BulkRow {
  key: string;
  startAt: string;
  endAt: string;
  notes: string;
  intervals: BreakIntervalDraft[];
}

function emptyRow(): BulkRow {
  return {
    key: crypto.randomUUID(),
    startAt: '',
    endAt: '',
    notes: '',
    intervals: [],
  };
}

function localInputToIso(value: string): string {
  return new Date(value).toISOString();
}

export default function BulkShiftsPage() {
  const router = useRouter();
  const { user, userName, isLoading: authLoading } = useAuthUser();
  const [profiles, setProfiles] = useState<PublicJobProfile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [profilesError, setProfilesError] = useState<string | null>(null);
  const [jobProfileId, setJobProfileId] = useState('');
  const [rows, setRows] = useState<BulkRow[]>([emptyRow()]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function loadProfiles() {
      try {
        const list = await listJobProfiles();
        if (cancelled) return;
        setProfiles(list);
        const primary = list.find((p) => p.isPrimary)?.id ?? list[0]?.id ?? '';
        setJobProfileId(primary);
        setProfilesError(null);
      } catch (err: unknown) {
        if (!cancelled) {
          setProfilesError(err instanceof Error ? err.message : 'Kunde inte ladda jobbprofiler');
        }
      } finally {
        if (!cancelled) setProfilesLoading(false);
      }
    }

    void loadProfiles();
    return () => {
      cancelled = true;
    };
  }, [user]);

  function updateRow(key: string, patch: Partial<BulkRow>) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function addRow() {
    setRows((current) => (current.length >= MAX_ROWS ? current : [...current, emptyRow()]));
  }

  function removeRow(key: string) {
    setRows((current) =>
      current.length <= 1 ? current : current.filter((row) => row.key !== key),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!jobProfileId) {
      setError('Välj en jobbprofil');
      return;
    }

    const shifts: BulkCreateShiftsBody['shifts'] = [];

    for (const row of rows) {
      if (!row.startAt || !row.endAt) {
        setError('Alla rader behöver start och slut tid');
        return;
      }

      const startAt = localInputToIso(row.startAt);
      const endAt = localInputToIso(row.endAt);
      if (new Date(endAt).getTime() <= new Date(startAt).getTime()) {
        setError('Sluttid måste vara efter starttid på varje rad');
        return;
      }

      if (hasIncompleteBreakDrafts(row.intervals)) {
        setError('Fyll i både start och slut för varje rast, eller ta bort raden');
        return;
      }
      const breakIntervals = draftsToBreakIntervals(row.intervals);
      for (const br of breakIntervals) {
        if (new Date(br.endAt).getTime() <= new Date(br.startAt).getTime()) {
          setError('Rast: slut måste vara efter start på varje rad');
          return;
        }
        if (
          new Date(br.startAt).getTime() < new Date(startAt).getTime() ||
          new Date(br.endAt).getTime() > new Date(endAt).getTime()
        ) {
          setError('Rastintervall måste ligga inom passets start och slut');
          return;
        }
      }

      const notes = row.notes.trim();
      shifts.push({
        startAt,
        endAt,
        breakIntervals,
        ...(notes.length > 0 ? { notes } : {}),
      });
    }

    setIsPending(true);
    try {
      await createBulkShifts({ jobProfileId, shifts });
      router.push('/shifts');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Kunde inte skapa passen');
    } finally {
      setIsPending(false);
    }
  }

  const isLoading = authLoading || (!!user && profilesLoading);

  if (isLoading) return <PageLoading label="laddar..." userName={userName} />;

  if (!user) {
    return <AuthRequired />;
  }

  if (!user.isPremium) {
    return (
      <AppShell userName={userName}>
        <FadeIn className="mx-auto w-full max-w-lg">
          <Card>
            <CardHeader>
              <CardTitle>Bulk-logg</CardTitle>
              <CardDescription>
                Logga upp till {MAX_ROWS} pass samtidigt med samma jobbprofil.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Bulk-logg ingår i Premium. Free kan logga ett pass i taget.
              </p>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/premium">Uppgradera</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/shifts/new">Logga ett pass</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </AppShell>
    );
  }

  return (
    <AppShell userName={userName}>
      <FadeIn>
        <Card>
          <CardHeader>
            <CardTitle>Bulk-logga pass</CardTitle>
            <CardDescription>
              Samma jobbprofil för alla rader. Max {MAX_ROWS} pass per gång. Rast anges som
              intervall.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profilesError ? (
              <PageError message={profilesError} variant="inline" />
            ) : profiles.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Du behöver en jobbprofil först.{' '}
                <Link href="/job-profiles/new" className="underline underline-offset-4">
                  Skapa en jobbprofil
                </Link>
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="space-y-2">
                  <Label htmlFor="jobProfileId">Jobbprofil</Label>
                  <select
                    name="jobProfileId"
                    id="jobProfileId"
                    value={jobProfileId}
                    onChange={(e) => setJobProfileId(e.target.value)}
                    required
                    className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                        {p.isPrimary ? ' (primär)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-4">
                  {rows.map((row, index) => (
                    <div
                      key={row.key}
                      className="flex flex-col gap-3 rounded-lg border border-border p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Pass {index + 1}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={rows.length <= 1}
                          onClick={() => removeRow(row.key)}
                          aria-label="Ta bort rad"
                        >
                          <Minus className="size-4" />
                        </Button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`start-${row.key}`}>Start</Label>
                          <Input
                            id={`start-${row.key}`}
                            type="datetime-local"
                            required
                            value={row.startAt}
                            onChange={(e) => updateRow(row.key, { startAt: e.target.value })}
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`end-${row.key}`}>Slut</Label>
                          <Input
                            id={`end-${row.key}`}
                            type="datetime-local"
                            required
                            value={row.endAt}
                            onChange={(e) => updateRow(row.key, { endAt: e.target.value })}
                            className="h-11"
                          />
                        </div>
                      </div>
                      <BreakIntervalsEditor
                        value={row.intervals}
                        onChange={(intervals) => updateRow(row.key, { intervals })}
                        disabled={isPending}
                      />
                      <div className="space-y-2">
                        <Label htmlFor={`notes-${row.key}`}>Anteckning</Label>
                        <Input
                          id={`notes-${row.key}`}
                          type="text"
                          maxLength={2000}
                          value={row.notes}
                          onChange={(e) => updateRow(row.key, { notes: e.target.value })}
                          className="h-11"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {error ? <PageError message={error} variant="inline" /> : null}

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={rows.length >= MAX_ROWS}
                    onClick={addRow}
                    className="gap-1.5"
                  >
                    <Plus className="size-4" />
                    Lägg till rad
                  </Button>
                  <Button type="submit" disabled={isPending} className="flex-1 sm:flex-none">
                    {isPending ? 'Sparar…' : `Spara ${rows.length} pass`}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/shifts">Avbryt</Link>
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </AppShell>
  );
}
