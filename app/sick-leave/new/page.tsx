'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { AuthRequired, PageError } from '@/components/feedback/page-error';
import { PageLoading } from '@/components/feedback/page-loading';
import { AppShell } from '@/components/layout/app-shell';
import { FadeIn } from '@/components/motion/fade-in';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthUser } from '@/hooks/use-auth-user';
import { createSickLeave, listJobProfiles } from '@/lib/api';
import type { PublicJobProfile } from '@/lib/types';

interface FormState {
  error: string | null;
}

const initialState: FormState = { error: null };

export default function NewSickLeavePage() {
  const router = useRouter();
  const { user, userName, isLoading: authLoading } = useAuthUser();
  const [profiles, setProfiles] = useState<PublicJobProfile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [profilesError, setProfilesError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.isPremium) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfilesLoading(false);
      return;
    }

    let cancelled = false;
    void listJobProfiles()
      .then((list) => {
        if (!cancelled) {
          setProfiles(list);
          setProfilesError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setProfilesError(err instanceof Error ? err.message : 'Kunde inte ladda profiler');
        }
      })
      .finally(() => {
        if (!cancelled) setProfilesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const [state, formAction, isPending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      const jobProfileId = String(formData.get('jobProfileId') ?? '');
      const startDate = String(formData.get('startDate') ?? '');
      const endDate = String(formData.get('endDate') ?? '');
      const notes = String(formData.get('notes') ?? '');

      if (!jobProfileId) return { error: 'Välj jobb profil' };
      if (!startDate || !endDate) return { error: 'Ange start- och slutdatum' };
      if (endDate < startDate)
        return { error: 'Slutdatum måste vara samma dag eller efter startdatum' };

      try {
        await createSickLeave({
          jobProfileId,
          startDate,
          endDate,
          notes: notes.length > 0 ? notes : undefined,
        });
        router.push('/sick-leave');
        return { error: null };
      } catch (err) {
        return { error: err instanceof Error ? err.message : 'Kunde inte skapa sjukanmälan' };
      }
    },
    initialState,
  );

  const primaryId = profiles.find((p) => p.isPrimary)?.id ?? profiles[0]?.id;
  const isLoading = authLoading || (!!user?.isPremium && profilesLoading);

  if (isLoading) return <PageLoading label="Laddar..." userName={userName} />;
  if (!user) return <AuthRequired />;

  if (!user.isPremium) {
    return (
      <AppShell userName={userName}>
        <FadeIn className="mx-auto max-w-lg space-y-4">
          <h1 className="text-2xl font-semibold">Ny sjukanmälan</h1>
          <p className="text-sm text-muted-foreground">Kräver Premium.</p>
          <Button asChild>
            <Link href="/premium">Uppgradera</Link>
          </Button>
        </FadeIn>
      </AppShell>
    );
  }

  return (
    <AppShell userName={userName}>
      <FadeIn>
        <Card>
          <CardHeader>
            <CardTitle>Ny sjukperiod</CardTitle>
            <CardDescription>
              Första passdagen i perioden blir karensdag. Övriga dagar ger 80% av (timlön x timmar).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profilesError ? (
              <PageError message={profilesError} variant="inline" />
            ) : profiles.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Skapa en jobbprofil.{' '}
                <Link href="/job-profiles/new" className="underline underline-offset-4">
                  Skapa profil
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
                  <Label htmlFor="startDate">Från</Label>
                  <Input id="startDate" name="startDate" type="date" required className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Till</Label>
                  <Input id="endDate" name="endDate" type="date" required className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Anteckning (valfritt)</Label>
                  <textarea
                    id="notes"
                    name="notes"
                    maxLength={2000}
                    rows={3}
                    className="flex min-h-20 w-full rounded-md border border-input bg-transparent p-1.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  />
                </div>

                {state.error ? <PageError message={state.error} variant="inline" /> : null}

                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={isPending} className="flex-1">
                    {isPending ? 'Sparar…' : 'Spara period'}
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" asChild>
                    <Link href="/sick-leave">Avbryt</Link>
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
