'use client';

import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { FadeIn } from '@/components/motion/fade-in';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthUser } from '@/hooks/use-auth-user';
import { getTaxSettings, upsertTaxSettings } from '@/lib/api';
import type { PublicTaxSettings } from '@/lib/types';

interface FormState {
  error: string | null;
  success: string | null;
}

const initialState: FormState = { error: null, success: null };

const TABLE_OPTIONS = [29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42] as const;

export default function TaxSettingsPage() {
  const { user, userName, isLoading: authLoading } = useAuthUser();
  const [settings, setSettings] = useState<PublicTaxSettings | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    void getTaxSettings()
      .then((data) => {
        if (!cancelled) {
          setSettings(data);
          setLoadError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Kunde inte ladda');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const [state, formAction, isPending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      const taxYear = Number(formData.get('taxYear'));
      const tableNumber = Number(formData.get('tableNumber'));
      const columnNumber = Number(formData.get('columnNumber'));
      const dayTypeRaw = String(formData.get('dayType') ?? '30B');

      if (!Number.isInteger(taxYear) || taxYear < 2000 || taxYear > 2100) {
        return { error: 'Ange ett giltigt skatteår (2000-2100)', success: null };
      }

      if (!Number.isInteger(tableNumber) || tableNumber < 29 || tableNumber > 42) {
        return { error: 'Tabellnummer måste vara 29-42', success: null };
      }

      if (!Number.isInteger(columnNumber) || columnNumber < 1 || columnNumber > 6) {
        return { error: 'Kolumn måste vara 1–6', success: null };
      }

      if (dayTypeRaw !== '30B' && dayTypeRaw !== '30%') {
        return { error: 'Ogiltig dagtyp', success: null };
      }

      try {
        const saved = await upsertTaxSettings({
          taxYear,
          tableNumber,
          columnNumber,
          dayType: dayTypeRaw,
        });
        setSettings(saved);
        return { error: null, success: 'Skatteinställningar sparade' };
      } catch (err) {
        return {
          error: err instanceof Error ? err.message : 'Kunde inte spara',
          success: null,
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

  const defaultYear = settings?.taxYear ?? new Date().getFullYear();
  const defaultTable = settings?.tableNumber ?? 33;
  const defaultColumn = settings?.columnNumber ?? 1;
  const defaultDayType = settings?.dayType === '30%' ? '30%' : '30B';

  return (
    <AppShell userName={userName}>
      <FadeIn className="mx-auto w-full max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Skatteinställningar</CardTitle>
            <CardDescription>
              Välj Skatteverkets tabellnummer (finns på lönespecen). Kolumn 1 gäller vanlig lön.
              Månadsnetto räknas från ackumulerat brutto — inte per pass.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadError ? (
              <p className="mb-4 text-sm text-destructive" role="alert">
                {loadError}
              </p>
            ) : null}

            <form action={formAction}>
              <div className="space-y-2">
                <Label htmlFor="taxYear">Skatteår</Label>
                <Input
                  id="taxYear"
                  name="taxYear"
                  type="number"
                  required
                  min={2000}
                  max={2100}
                  defaultValue={defaultYear}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tableNumber">Tabellnummer</Label>
                <select
                  name="tableNumber"
                  id="tableNumber"
                  defaultValue={defaultTable}
                  className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  {TABLE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      Tabell {n}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Högre nummer ≈ högre kommunalskatt. Hitta ditt på Skatteverket / lönespec.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="columnNumber">Kolumn</Label>
                <select
                  id="columnNumber"
                  name="columnNumber"
                  defaultValue={defaultColumn}
                  className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      Kolumn {n}
                      {n === 1 ? ' (lön — vanligt)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dayType">Tabelltyp</Label>
                <select
                  id="dayType"
                  name="dayType"
                  defaultValue={defaultDayType}
                  className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <option value="30B">30B — månadslön (rekommenderas)</option>
                  <option value="30%">30% — höga inkomster (sällan manuell)</option>
                </select>
              </div>

              {state.error ? (
                <p
                  className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  role="alert"
                >
                  {state.error}
                </p>
              ) : null}

              {state.success ? (
                <p
                  className="rounded-lg border border-primary/20 bg-emerald-500 px-3 py-2 text-sm text-foreground mt-4"
                  role="status"
                >
                  {state.success}
                </p>
              ) : null}

              <Button type="submit" disabled={isPending} size="lg" className="h-11 w-full mt-4">
                {isPending ? 'Sparar…' : 'Spara'}
              </Button>
            </form>

            <p className="mt-6 text-sm text-muted-foreground">
              <Link href="/summary" className="underline-offset-4 hover:underline">
                Till månadssammanfattning
              </Link>
              {' · '}
              Utan sparad tabell används schablonskatt från jobbprofilen.
            </p>
          </CardContent>
        </Card>
      </FadeIn>
    </AppShell>
  );
}
