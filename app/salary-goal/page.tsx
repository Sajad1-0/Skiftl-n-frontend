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
import { getSalaryGoal, upsertSalaryGoal } from '@/lib/api';
import { kronorToOre, oreToKronor } from '@/lib/money';

interface FormState {
  error: string | null;
}

const initialState: FormState = { error: null };

export default function SalaryGoalPage() {
  const router = useRouter();
  const { user, userName, isLoading: authLoading } = useAuthUser();
  const [goalKronor, setGoalKronor] = useState<string>('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [goalLoading, setGoalLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGoalLoading(false);
      return;
    }

    // Free: visa paywall utan att anropa GET /salary-goal.
    if (!user.isPremium) {
      setGoalLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const goal = await getSalaryGoal();
        if (cancelled) return;
        if (goal.monthlySalaryGoalOre != null) {
          setGoalKronor(String(oreToKronor(goal.monthlySalaryGoalOre)));
        } else {
          setGoalKronor('');
        }
        setLoadError(null);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Kunde inte ladda lönemål');
        }
      } finally {
        if (!cancelled) setGoalLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const [state, formAction, isPending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      const raw = String(formData.get('goalKronor') ?? '').trim();
      const clear = formData.get('clear') === '1';

      try {
        if (clear) {
          await upsertSalaryGoal({ monthlySalaryGoalOre: null });
          setGoalKronor('');
          router.push('/summary');
          return { error: null };
        }

        const kronor = Number(raw.replace(',', '.'));
        if (!Number.isFinite(kronor) || kronor <= 0) {
          return { error: 'Ange ett belopp större än 0 kr (eller rensa målet)' };
        }

        await upsertSalaryGoal({ monthlySalaryGoalOre: kronorToOre(kronor) });
        router.push('/summary');
        return { error: null };
      } catch (err) {
        return {
          error: err instanceof Error ? err.message : 'Kunde inte spara lönemål',
        };
      }
    },
    initialState,
  );

  if (authLoading || (user && goalLoading)) {
    return <PageLoading label="Laddar lönemål…" userName={userName} />;
  }

  if (!user) {
    return <AuthRequired />;
  }

  if (!user.isPremium) {
    return (
      <AppShell userName={userName}>
        <FadeIn className="mx-auto w-full max-w-lg">
          <Card>
            <CardHeader>
              <CardTitle>Lönemål</CardTitle>
              <CardDescription>
                Sätt ett månatligt nettomål och följ progress i dashboard och sammanfattning.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">Lönemål ingår i Premium.</p>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/premium">Uppgradera</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/summary">Tillbaka</Link>
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
      <FadeIn className="mx-auto w-full max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Lönemål (netto)</CardTitle>
            <CardDescription>
              Ange mål i kronor. Progress beräknas mot månadens netto i sammanfattningen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadError ? <PageError message={loadError} variant="inline" /> : null}

            <form action={formAction} className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="goalKronor">Månadsmål (kr)</Label>
                <Input
                  id="goalKronor"
                  name="goalKronor"
                  type="number"
                  min={0}
                  step={100}
                  value={goalKronor}
                  onChange={(e) => setGoalKronor(e.target.value)}
                  placeholder="t.ex. 25000"
                  className="h-11"
                />
              </div>

              {state.error ? <PageError message={state.error} variant="inline" /> : null}

              <div className="flex flex-wrap gap-2 pt-2">
                <Button type="submit" disabled={isPending} className="flex-1">
                  {isPending ? 'Sparar…' : 'Spara mål'}
                </Button>
                <Button type="submit" name="clear" value="1" variant="outline" disabled={isPending}>
                  Rensa mål
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/summary">Avbryt</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </FadeIn>
    </AppShell>
  );
}
