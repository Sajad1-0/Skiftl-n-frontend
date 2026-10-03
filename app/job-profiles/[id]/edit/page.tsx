'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { FadeIn } from '@/components/motion/fade-in';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthUser } from '@/hooks/use-auth-user';
import { getJobProfile, updateJobProfile, listCollectiveAgreements } from '@/lib/api';
import { kronorToOre, oreToKronor } from '@/lib/money';
import type { PublicAgreement, PublicJobProfile } from '@/lib/types';

interface FormState {
  error: string | null;
}

const initialState: FormState = { error: null };

export default function EditJobProfilePage() {
  const params = useParams<{ id: string }>();
  const profileId = params.id;
  const router = useRouter();
  const { user, userName, isLoading: authLoading } = useAuthUser();

  const [profile, setProfile] = useState<PublicJobProfile | null>(null);
  const [agreements, setAgreements] = useState<PublicAgreement[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !profileId) return;

    let cancelled = false;

    async function load() {
      try {
        const [profileData, agreementData] = await Promise.all([
          getJobProfile(profileId),
          listCollectiveAgreements().catch(() => [] as PublicAgreement[]),
        ]);
        if (!cancelled) {
          setProfile(profileData);
          setAgreements(agreementData);
          setLoadError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'Kunde inte ladda profil');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [user, profileId]);

  const [state, formAction, isPending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      const name = String(formData.get('name') ?? '').trim();
      const employerName = String(formData.get('employerName') ?? '').trim();
      const hourlyWageKronor = Number(formData.get('hourlyWageKronor'));
      const taxRate = Number(formData.get('taxRate'));
      const isPrimary = formData.get('isPrimary') === 'on';
      const agreementRaw = String(formData.get('collectiveAgreementId') ?? '').trim();

      if (name.length < 2) {
        return { error: 'Namn måste vara minst 2 tecken' };
      }

      if (!Number.isFinite(hourlyWageKronor) || hourlyWageKronor <= 0) {
        return { error: 'Ange en giltig timlön i kronor' };
      }

      if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
        return { error: 'Skattesats måste vara mellan 0 och 100' };
      }

      if (employerName.length > 0 && employerName.length < 2) {
        return { error: 'Arbetsgivare måste vara minst 2 tecken' };
      }

      try {
        await updateJobProfile(profileId, {
          name,
          hourlyWage: kronorToOre(hourlyWageKronor),
          taxRate,
          employerName: employerName.length === 0 ? null : employerName,
          isPrimary,
          collectiveAgreementId: agreementRaw.length > 0 ? agreementRaw : null,
        });
        router.push('/job-profiles');
        return { error: null };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Kunde inte uppdatera jobbprofil',
        };
      }
    },
    initialState,
  );

  if (authLoading || (user && loading)) {
    return (
      <AppShell userName={userName}>
        <p className="text-sm text-muted-foreground">Laddar…</p>
      </AppShell>
    );
  }

  if (loadError || !profile) {
    return (
      <AppShell userName={userName}>
        <p className="text-sm text-destructive" role="alert">
          {loadError ?? 'Profilen hittades inte'}
        </p>
        <Link
          href="/job-profiles"
          className="mt-4 inline-block text-sm underline-offset-4 hover:underline"
        >
          Tillbaka till listan
        </Link>
      </AppShell>
    );
  }

  const knownAgreementIds = new Set(agreements.map((a) => a.id));
  const orphanAgreementId =
    profile.collectiveAgreementId && !knownAgreementIds.has(profile.collectiveAgreementId)
      ? profile.collectiveAgreementId
      : null;

  return (
    <AppShell userName={userName}>
      <FadeIn className="mx-auto w-full max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Redigera jobbprofil</CardTitle>
            <CardDescription>
              Ändringar gäller nya pass. Gamla pass behåller sina löne-snapshots.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Namn</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  defaultValue={profile.name}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourlyWageKronor">Timlön</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                    SEK
                  </span>
                  <Input
                    id="hourlyWageKronor"
                    name="hourlyWageKronor"
                    type="number"
                    required
                    min={1}
                    step="0.01"
                    defaultValue={oreToKronor(profile.hourlyWage)}
                    className="h-11 pl-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxRate">Skattesats (%)</Label>
                <Input
                  id="taxRate"
                  name="taxRate"
                  type="number"
                  required
                  min={0}
                  max={100}
                  step="0.01"
                  defaultValue={Number(profile.taxRate)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employerName">Arbetsgivare (valfritt)</Label>
                <Input
                  id="employerName"
                  name="employerName"
                  type="text"
                  defaultValue={profile.employerName ?? ''}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="collectiveAgreementId">Kollektivavtal (valfritt)</Label>
                <select
                  name="collectiveAgreementId"
                  id="collectiveAgreementId"
                  className="flex h-11 w-full rounded-md border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  defaultValue={profile.collectiveAgreementId ?? ''}
                >
                  <option value="">Ingen OB</option>
                  {orphanAgreementId ? (
                    <option value={orphanAgreementId}>Nuvarande avtal (kunde inte laddas)</option>
                  ) : null}
                  {agreements.map((agreement) => (
                    <option key={agreement.id} value={agreement.id}>
                      {agreement.name}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  name="isPrimary"
                  type="checkbox"
                  defaultChecked={profile.isPrimary}
                  className="size-4 rounded border-input"
                />
                Sätt som primär profil
              </label>

              {state.error ? (
                <p
                  className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  role="alert"
                >
                  {state.error}
                </p>
              ) : null}
              <Button type="submit" disabled={isPending} size="lg" className="h-11 w-full">
                {isPending ? 'Sparar…' : 'Spara ändringar'}
              </Button>
            </form>

            <p className="mt-6 text-sm text-muted-foreground">
              <Link href="/job-profiles" className="underline-offset-4 hover:underline">
                Tillbaka till listan
              </Link>
            </p>
          </CardContent>
        </Card>
      </FadeIn>
    </AppShell>
  );
}
