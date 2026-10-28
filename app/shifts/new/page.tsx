'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useRef, useState } from 'react';
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

interface FormState {
  error: string | null;
}

const initialState: FormState = { error: null };

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
  const [intervals, setIntervals] = useState<BreakIntervalDraft[]>([]);
  const intervalsRef = useRef(intervals);
  useEffect(() => {
    intervalsRef.current = intervals;
  }, [intervals]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function loadProfiles() {
      try {
        const list = await listJobProfiles();
        if (!cancelled) {
          setProfiles(list);
          setProfilesError(null);
        }
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

  const [state, formAction, isPending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      const jobProfileId = String(formData.get('jobProfileId') ?? '');
      const startRaw = String(formData.get('startAt') ?? '');
      const endRaw = String(formData.get('endAt') ?? '');
      const notes = String(formData.get('notes') ?? '').trim();

      if (!jobProfileId) return { error: 'Välj en jobbprofil' };
      if (!startRaw || !endRaw) return { error: 'Ange start och slut tid' };

      const startAt = localInputToIso(startRaw);
      const endAt = localInputToIso(endRaw);
      if (new Date(endAt).getTime() <= new Date(startAt).getTime()) {
        return { error: 'Slut måste vara efter start tid' };
      }

      try {
        if (isPremium) {
          if (hasIncompleteBreakDrafts(intervalsRef.current)) {
            return {
              error: 'Fyll i både start och slut för varje rast, eller ta bort raden',
            };
          }
          const breakIntervals = draftsToBreakIntervals(intervalsRef.current);
          for (const br of breakIntervals) {
            if (new Date(br.endAt).getTime() <= new Date(br.startAt).getTime()) {
              return { error: 'Rast: slut måste vara efter start' };
            }
            if (
              new Date(br.startAt).getTime() < new Date(startAt).getTime() ||
              new Date(br.endAt).getTime() > new Date(endAt).getTime()
            ) {
              return { error: 'Rastintervall måste ligga inom passets start och slut' };
            }
          }
          await createShift({
            jobProfileId,
            startAt,
            endAt,
            breakIntervals,
            notes: notes.length > 0 ? notes : undefined,
          });
        } else {
          const breakMinutes = Number(formData.get('breakMinutes') ?? '');
          if (!Number.isFinite(breakMinutes) || breakMinutes < 0) {
            return { error: 'Rast måste vara >= 0 minuter' };
          }
          await createShift({
            jobProfileId,
            startAt,
            endAt,
            breakMinutes,
            notes: notes.length > 0 ? notes : undefined,
          });
        }
        router.push('/shifts');
        return { error: null };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Kunde inte skapa pass',
        };
      }
    },
    initialState,
  );

  const primaryId = profiles.find((p) => p.isPrimary)?.id ?? profiles[0]?.id;

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
              <form action={formAction} className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobProfileId">Jobbprofil</Label>
                  <select
                    name="jobProfileId"
                    id="jobProfileId"
                    required
                    defaultValue={primaryId}
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
                    name="startAt"
                    type="datetime-local"
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endAt">Slut</Label>
                  <Input id="endAt" name="endAt" type="datetime-local" required className="h-11" />
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
                      name="breakMinutes"
                      type="number"
                      min={0}
                      step={1}
                      defaultValue={0}
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
                  <Input id="notes" name="notes" type="text" maxLength={2000} className="h-11" />
                </div>

                {state.error ? <PageError message={state.error} variant="inline" /> : null}

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
