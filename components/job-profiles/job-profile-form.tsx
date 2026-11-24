// components/job-profiles/job-profile-form.tsx
'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { PageError } from '@/components/feedback/page-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  type JobProfileFormDefaults,
  type JobProfileFormSubmitData,
  emptyJobProfileFormDefaults,
  buildJobProfileSubmitData,
} from '@/lib/job-profile-form';
import type { PublicAgreement } from '@/lib/types';

interface FormState {
  error: string | null;
}

const initialState: FormState = { error: null };

interface JobProfileFormProps {
  agreements: PublicAgreement[];
  initialValues?: Partial<JobProfileFormDefaults>;
  /** Avtal som finns på profilen men saknas i listan (edit). */
  orphanAgreementId?: string | null;
  submitLabel: string;
  pendingLabel?: string;
  cancelHref?: string;
  disabled?: boolean;
  showAgreementHint?: boolean;
  onSubmit: (data: JobProfileFormSubmitData) => Promise<void>;
}

const selectClassName =
  'flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

export function JobProfileForm({
  agreements,
  initialValues,
  orphanAgreementId = null,
  submitLabel,
  pendingLabel = 'Sparar…',
  cancelHref = '/job-profiles',
  disabled = false,
  showAgreementHint = false,
  onSubmit,
}: JobProfileFormProps) {
  const defaults = emptyJobProfileFormDefaults(initialValues);

  const [state, formAction, isPending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      if (disabled) return { error: null };

      const built = buildJobProfileSubmitData(formData);
      if ('error' in built) {
        return { error: built.error };
      }

      try {
        await onSubmit(built.data);
        return { error: null };
      } catch (err: unknown) {
        return {
          error: err instanceof Error ? err.message : 'Kunde inte spara jobbprofil',
        };
      }
    },
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <fieldset
        disabled={disabled || isPending}
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
            defaultValue={defaults.name}
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
              defaultValue={defaults.hourlyWageKronor}
              className="h-11 pl-12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxRate">Skattesats (%) — valfritt</Label>
          <Input
            id="taxRate"
            name="taxRate"
            type="number"
            min={0}
            max={100}
            step="0.01"
            placeholder="30"
            defaultValue={defaults.taxRate}
            className="h-11"
          />
          <p className="text-xs text-muted-foreground">
            Schablon för netto utan tabell. Premium: lämna tomt och använd Skatteverkets tabell
            under Skatt.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="employerName">Arbetsgivare (valfritt)</Label>
          <Input
            id="employerName"
            name="employerName"
            type="text"
            minLength={2}
            placeholder="Coop Östra"
            defaultValue={defaults.employerName}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="collectiveAgreementId">Kollektivavtal (valfritt)</Label>
          <select
            id="collectiveAgreementId"
            name="collectiveAgreementId"
            defaultValue={defaults.collectiveAgreementId}
            className={selectClassName}
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
          {showAgreementHint ? (
            <p className="text-xs text-muted-foreground">
              Utan avtal räknas bara grundlön. Med avtal beräknas OB när du loggar pass.
            </p>
          ) : null}
        </div>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            name="isPrimary"
            type="checkbox"
            defaultChecked={defaults.isPrimary}
            className="size-4 rounded border-input"
          />
          Sätt som primär profil
        </label>

        {state.error ? <PageError message={state.error} variant="inline" /> : null}

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={disabled || isPending} size="lg" className="h-11 flex-1">
            {isPending ? pendingLabel : submitLabel}
          </Button>
          <Button type="button" variant="outline" size="lg" className="h-11" asChild>
            <Link href={cancelHref}>Avbryt</Link>
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
