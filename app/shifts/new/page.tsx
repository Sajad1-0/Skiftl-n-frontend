'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageError } from '@/components/feedback/page-error';
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
import { createShift, listJobProfiles } from '@/lib/api';
import type { PublicJobProfile } from '@/lib/types';

/** datetime-local value → ISO UTC for API */
function localInputToIso(value: string): string {
  return new Date(value).toISOString();
}

export default function NewShiftPage() {
  const router = useRouter();
  const { user, userName, isLoading: authLoading } = useAuthUser();
  const [profiles, setProfiles] = useState<PublicJobProfile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [profilesError, setProfilesError] = useState<string | null>(null);
  const [jobProfileId, setJobProfileId] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [breakMinutes, setBreakMinutes] = useState('0');
  const [notes, setNotes] = useState('');
  const [intervals, setIntervals] = useState<BreakIntervalDraft[]>([]);
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

  const isPremium = user?.isPremium === true;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!jobProfileId) {
      setError('Välj en jobbprofil');
      return;
    }
    if (!startAt || !endAt) {
      setError('Ange start och slut tid');
      return;
    }

    const startIso = localInputToIso(startAt);
    const endIso = localInputToIso(endAt);
    if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
      setError('Slut måste vara efter start tid');
      return;
    }

    setIsPending(true);
    try {
      if (isPremium) {
        if (hasIncompleteBreakDrafts(intervals)) {
          setError('Fyll i både start och slut för varje rast, eller ta bort raden');
          return;
        }
        const breakIntervals = draftsToBreakIntervals(intervals);
        for (const br of breakIntervals) {
          if (new Date(br.endAt).getTime() <= new Date(br.startAt).getTime()) {
            setError('Rast: slut måste vara efter start');
            return;
          }
          if (
            new Date(br.startAt).getTime() < new Date(startIso).getTime() ||
            new Date(br.endAt).getTime() > new Date(endIso).getTime()
          ) {
            setError('Rastintervall måste ligga inom passets start och slut');
            return;
          }
        }
        await createShift({
          jobProfileId,
          startAt: startIso,
          endAt: endIso,
          breakIntervals,
          notes: notes.trim().length > 0 ? notes.trim() : undefined,
        });
      } else {
        const minutes = Number(breakMinutes);
        if (!Number.isFinite(minutes) || minutes < 0) {
          setError('Rast måste vara >= 0 minuter');
          return;
        }
        await createShift({
          jobProfileId,
          startAt: startIso,
          endAt: endIso,
          breakMinutes: minutes,
          notes: notes.trim().length > 0 ? notes.trim() : undefined,
        });
      }
      router.push('/shifts');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Kunde inte skapa pass');
    } finally {
      setIsPending(false);
    }
  }

  const isLoading = authLoading || (!!user && profilesLoading);

  if (isLoading) {
    return <PageLoading label="Laddar…" userName={userName} />;
  }

  return (
    <AppShell userName={userName}>
      <FadeIn className="mx-auto w-full max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Logga Pass</CardTitle>
            <CardDescription>
              Timlön och brutto beräknas på servern utifrån vald jobbprofil
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
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobProfileId">Jobbprofil</Label>
                  <select
                    id="jobProfileId"
                    required
                    value={jobProfileId}
                    onChange={(e) => setJobProfileId(e.target.value)}
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

                <div className="space-y-2">
                  <Label htmlFor="startAt">Start</Label>
                  <Input
                    id="startAt"
                    type="datetime-local"
                    required
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endAt">Slut</Label>
                  <Input
                    id="endAt"
                    type="datetime-local"
                    required
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                    className="h-11"
                  />
                </div>

                {isPremium ? (
                  <BreakIntervalsEditor
                    value={intervals}
                    onChange={setIntervals}
                    disabled={isPending}
                  />
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="breakMinutes">Rast (minuter)</Label>
                    <Input
                      id="breakMinutes"
                      type="number"
                      min={0}
                      step={1}
                      value={breakMinutes}
                      onChange={(e) => setBreakMinutes(e.target.value)}
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Premium: ange exakta rasttider istället.{' '}
                      <Link href="/premium" className="underline underline-offset-4">
                        Uppgradera
                      </Link>
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Anteckning (valfritt)</Label>
                  <Input
                    id="notes"
                    type="text"
                    maxLength={2000}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="h-11"
                  />
                </div>

                {error ? <PageError message={error} variant="inline" /> : null}

                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={isPending} className="flex-1">
                    {isPending ? 'Sparar...' : 'Spara pass'}
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
