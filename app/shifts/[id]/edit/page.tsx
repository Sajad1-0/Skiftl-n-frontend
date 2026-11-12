'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageError } from '@/components/feedback/page-error';
import { PageLoading } from '@/components/feedback/page-loading';
import { AppShell } from '@/components/layout/app-shell';
import { FadeIn } from '@/components/motion/fade-in';
import BreakIntervalsEditor, {
  breakIntervalsToDrafts,
  prepareBreakIntervals,
  type BreakIntervalDraft,
} from '@/components/shifts/break-intervals-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthUser } from '@/hooks/use-auth-user';
import { useJobProfiles } from '@/hooks/use-job-profiles';
import { getJobProfile, getShift, updateShift } from '@/lib/api';
import {
  isoToDatetimeLocal,
  localInputToIso,
  syncEndAtFromStart,
} from '@/lib/shift-datetime';
import PremiumUpgradeDialog from '@/components/premium/premium-upgrade-dialog';


export default function EditShiftPage() {
  const params = useParams<{ id: string }>();
  const shiftId = params.id;
  const router = useRouter();
  const { user, userName, isLoading: authLoading } = useAuthUser();
  const {
    profiles,
    setProfiles,
    isLoading: profilesLoading,
    error: profilesError,
  } = useJobProfiles({ enabled: !!user });

  const [shiftLoading, setShiftLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [jobProfileId, setJobProfileId] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [breakMinutes, setBreakMinutes] = useState('0');
  const [notes, setNotes] = useState('');
  const [intervals, setIntervals] = useState<BreakIntervalDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!user || !shiftId || profilesLoading) return;

    let cancelled = false;

    async function loadShift() {
      try {
        const shift = await getShift(shiftId);
        if (cancelled) return;

        try {
          const owned = await getJobProfile(shift.jobProfileId);
          if (!cancelled) {
            setProfiles((current) =>
              current.some((p) => p.id === owned.id) ? current : [...current, owned],
            );
          }
        } catch {
          /* select kan fortfarande visa id */
        }

        setJobProfileId(shift.jobProfileId);
        setStartAt(isoToDatetimeLocal(shift.startAt));
        setEndAt(isoToDatetimeLocal(shift.endAt));
        setBreakMinutes(String(shift.breakMinutes));
        setNotes(shift.notes ?? '');
        setIntervals(breakIntervalsToDrafts(shift.breakIntervals));
        setLoadError(null);
      } catch (err: unknown) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Kunde inte ladda passet');
        }
      } finally {
        if (!cancelled) setShiftLoading(false);
      }
    }

    void loadShift();
    return () => {
      cancelled = true;
    };
  }, [user, shiftId, profilesLoading, setProfiles]);

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
        const prepared = prepareBreakIntervals(intervals, startAt, endAt);
        if ('error' in prepared) {
          setError(prepared.error);
          return;
        }
        await updateShift(shiftId, {
          jobProfileId,
          startAt: startIso,
          endAt: endIso,
          breakIntervals: prepared.breakIntervals,
          notes: notes.trim().length > 0 ? notes.trim() : null,
        });
      } else {
        const minutes = Number(breakMinutes);
        if (!Number.isFinite(minutes) || minutes < 0) {
          setError('Rast måste vara >= 0 minuter');
          return;
        }
        await updateShift(shiftId, {
          jobProfileId,
          startAt: startIso,
          endAt: endIso,
          breakMinutes: minutes,
          notes: notes.trim().length > 0 ? notes.trim() : null,
        });
      }
      router.push('/shifts');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Kunde inte uppdatera pass');
    } finally {
      setIsPending(false);
    }
  }

  const isLoading = authLoading || (!!user && (profilesLoading || shiftLoading));

  if (isLoading) {
    return <PageLoading label="Laddar pass…" userName={userName} />;
  }

  return (
    <AppShell userName={userName}>
      <FadeIn className="mx-auto w-full max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Redigera pass</CardTitle>
            <CardDescription>
              Ändringar räknar om brutto och OB utifrån vald jobbprofil
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadError || profilesError ? (
              <PageError message={loadError ?? profilesError ?? ''} variant="inline" />
            ) : profiles.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Ingen jobbprofil tillgänglig.{' '}
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
                        {p.archivedAt ? ' (arkiverad)' : ''}
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
                    onChange={(e) => {
                      const nextStart = e.target.value;
                      setEndAt((prevEnd) => syncEndAtFromStart(startAt, nextStart, prevEnd));
                      setStartAt(nextStart);
                    }}
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
                    <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                      <span>Premium: ange exakta rasttider istället.</span>
                      <PremiumUpgradeDialog
                        featureId="breaks"
                        triggerLabel="Uppgradera"
                        triggerVariant="link"
                        triggerSize="sm"
                        triggerClassName="h-auto p-0 text-xs underline underline-offset-4"
                      />
                    </div>
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
                    {isPending ? 'Sparar…' : 'Spara ändringar'}
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
