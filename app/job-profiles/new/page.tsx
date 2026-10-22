'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useState, useEffect } from 'react';
import { PageError } from '@/components/feedback/page-error';
import { PageLoading } from '@/components/feedback/page-loading';
import { AppShell } from '@/components/layout/app-shell';
import { FadeIn } from '@/components/motion/fade-in';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthUser } from '@/hooks/use-auth-user';
import { createJobProfile, listCollectiveAgreements, listJobProfiles } from '@/lib/api';
import { kronorToOre } from '@/lib/money';
import type { PublicAgreement } from '@/lib/types';

interface FormState {
  error: string | null;
}

const initialState: FormState = { error: null };

export default function NewJobProfilePage() {
  const router = useRouter();
  const { user, userName, isLoading: authLoading } = useAuthUser();
  const [agreements, setAgreements] = useState<PublicAgreement[]>([]);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    void listCollectiveAgreements()
      .then((data) => {
        if (!cancelled) setAgreements(data);
      })
      .catch(() => {
        if (!cancelled) setAgreements([]);
      });

    void listJobProfiles()
      .then((profiles) => {
        if (cancelled) return;
        const active = profiles.filter((p) => p.archivedAt == null).length;
        const cap = user.isPremium ? 5 : 1;
        if (active >= cap) {
          setBlockedReason(
            user.isPremium
              ? 'Du har redan 5 aktiva profiler. Arkivera en först.'
              : 'Gratisplan tillåter en profil. Uppgradera till Premium för fler.',
          );
        } else {
          setBlockedReason(null);
        }
      })
      .catch(() => {
        /* create-form fungerar ändå; backend gate */
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const [state, formAction, isPending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      const name = String(formData.get('name') ?? '').trim();
      const employerName = String(formData.get('employerName') ?? '').trim();
      const hourlyWageKronor = Number(formData.get('hourlyWageKronor'));
      const taxRate = Number(formData.get('taxRate'));
      const isPrimary = formData.get('isPrimary') === 'on';
      const agreementRaw = String(formData.get('collectiveAgreementId') ?? '').trim();

      if (!Number.isFinite(hourlyWageKronor) || hourlyWageKronor <= 0) {
        return { error: 'Ange en giltig timlön i kronor' };
      }

      if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
        return { error: 'Skattesats måste vara mellan 0 och 100' };
      }

      try {
        await createJobProfile({
          name,
          hourlyWage: kronorToOre(hourlyWageKronor),
          taxRate,
          employerName: employerName.length >= 2 ? employerName : undefined,
          isPrimary,
          collectiveAgreementId: agreementRaw.length > 0 ? agreementRaw : null,
        });
        router.push('/job-profiles');
        return { error: null };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Kunde inte skapa jobbprofil',
        };
      }
    },
    initialState,
  );

  if (authLoading) {
    return <PageLoading label="Laddar…" userName={userName} />;
  }

  return (
    <AppShell userName={userName}>
      <FadeIn className="mx-auto w-full max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Skapa jobbprofil</CardTitle>
            <CardDescription>Ange timlön i kronor. Vi sparar den som öre i API:t.</CardDescription>
          </CardHeader>
          <CardContent>
            {blockedReason ? (
              <div className="mb-4 space-y-3 rounded-lg border border-border bg-muted/40 p-4">
                <p className="text-sm text-muted-foreground">{blockedReason}</p>
                <Button asChild variant="outline">
                  <Link href={user?.isPremium ? '/job-profiles' : '/premium'}>
                    {user?.isPremium ? 'Tillbaka till profiler' : 'Uppgradera till Premium'}
                  </Link>
                </Button>
              </div>
            ) : null}
            <form action={formAction} className="flex flex-col gap-4">
              <fieldset
                disabled={!!blockedReason}
                className="flex flex-col gap-4 disabled:opacity-60"
              >
              <div className="space-y-2">
                <Label htmlFor="name">Namn</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  placeholder="Butiksbiträde"
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
                    placeholder="150"
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
                  placeholder="30"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employerName">Arbetsgivare (valfritt)</Label>
                <Input
                  id="employerName"
                  name="employerName"
                  type="text"
                  minLength={2}
                  placeholder="MaxiMarket"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="collectiveAgreementId">Kollektivavtal (valfritt)</Label>
                <select
                  name="collectiveAgreementId"
                  id="collectiveAgreementId"
                  className="flex h-11 w-full rounded-md border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  defaultValue=""
                >
                  <option value="">Ingen OB</option>
                  {agreements.map((agreement) => (
                    <option key={agreement.id} value={agreement.id}>
                      {agreement.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Utan avtal räknas bara grundlön. Med avtal beräknas OB när du loggar pass.
                </p>
              </div>

              <label className="flex items-center gap-2 text-sm font-medium">
                <input name="isPrimary" type="checkbox" className="size-4 rounded border-input" />
                Sätt som primär profil
              </label>

              {state.error ? <PageError message={state.error} /> : null}

              <Button
                type="submit"
                disabled={isPending || !!blockedReason}
                size="lg"
                className="h-11 w-full"
              >
                {isPending ? 'Sparar…' : 'Skapa profil'}
              </Button>
              </fieldset>
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
