'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { FadeIn } from '@/components/motion/fade-in';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createJobProfile, getCurrentUser } from '@/lib/api';
import { clearToken, getToken } from '@/lib/auth-storage';
import { kronorToOre } from '@/lib/money';
import type { PublicUser } from '@/lib/types';

interface FormState {
  error: string | null;
}

const initialState: FormState = { error: null };

export default function NewJobProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    void getCurrentUser()
      .then(setUser)
      .catch(() => {
        clearToken();
        router.replace('/login');
      });
  }, [router]);

  const [state, formAction, isPending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      const name = String(formData.get('name') ?? '').trim();
      const employerName = String(formData.get('employerName') ?? '').trim();
      const hourlyWageKronor = Number(formData.get('hourlyWageKronor'));
      const taxRate = Number(formData.get('taxRate'));
      const isPrimary = formData.get('isPrimary') === 'on';

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

  const userName = user
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`
    : undefined;

  return (
    <AppShell userName={userName}>
      <FadeIn className="mx-auto w-full max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Skapa jobbprofil</CardTitle>
            <CardDescription>Ange timlön i kronor. Vi sparar den som öre i API:t.</CardDescription>
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

              <label className="flex items-center gap-2 text-sm font-medium">
                <input name="isPrimary" type="checkbox" className="size-4 rounded border-input" />
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
                {isPending ? 'Sparar…' : 'Skapa profil'}
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
