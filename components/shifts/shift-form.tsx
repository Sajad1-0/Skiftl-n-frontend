'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PageError } from '@/components/feedback/page-error';
import PremiumUpgradeDialog from '@/components/premium/premium-upgrade-dialog';
import BreakIntervalsEditor from '@/components/shifts/break-intervals-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PublicJobProfile } from '@/lib/types';
import {
  type ShiftFormValues,
  type ShiftFormSubmitData,
  emptyShiftFormValues,
  buildShiftSubmitData,
} from '@/lib/shift-form';
import { syncEndAtFromStart } from '@/lib/shift-datetime';

interface ShiftFormProps {
  profiles: PublicJobProfile[];
  isPremium: boolean;
  initialValues?: Partial<ShiftFormValues>;
  submitLabel: string;
  pendingLabel?: string;
  cancelHref?: string;
  /** Hint under slut-fältet (create) */
  showEndFromStartHint?: boolean;
  onSubmit: (data: ShiftFormSubmitData) => Promise<void>;
}

const selectClassName =
  'flex h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

export function ShiftForm({
  profiles,
  isPremium,
  initialValues,
  submitLabel,
  pendingLabel = 'Sparar…',
  cancelHref = '/shifts',
  showEndFromStartHint = false,
  onSubmit,
}: ShiftFormProps) {
  const [values, setValues] = useState<ShiftFormValues>(() => emptyShiftFormValues(initialValues));
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  function patch(partial: Partial<ShiftFormValues>) {
    setValues((current) => ({ ...current, ...partial }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const built = buildShiftSubmitData(values, isPremium);
    if ('error' in built) {
      setError(built.error);
      return;
    }

    setIsPending(true);
    try {
      await onSubmit(built.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Kunde inte spara pass');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="jobProfileId">Jobbprofil</Label>
        <select
          id="jobProfileId"
          required
          value={values.jobProfileId}
          onChange={(e) => patch({ jobProfileId: e.target.value })}
          className={selectClassName}
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
          value={values.startAt}
          onChange={(e) => {
            const nextStart = e.target.value;
            setValues((current) => ({
              ...current,
              startAt: nextStart,
              endAt: syncEndAtFromStart(current.startAt, nextStart, current.endAt),
            }));
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
          value={values.endAt}
          onChange={(e) => patch({ endAt: e.target.value })}
          className="h-11"
        />
        {showEndFromStartHint ? (
          <p className="text-xs text-muted-foreground">
            Fylls i från start. Ändra bara tiden om passet är samma dag.
          </p>
        ) : null}
      </div>

      {isPremium ? (
        <BreakIntervalsEditor
          value={values.intervals}
          onChange={(intervals) => patch({ intervals })}
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
            value={values.breakMinutes}
            onChange={(e) => patch({ breakMinutes: e.target.value })}
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
          value={values.notes}
          onChange={(e) => patch({ notes: e.target.value })}
          className="h-11"
        />
      </div>

      {error ? <PageError message={error} variant="inline" /> : null}

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? pendingLabel : submitLabel}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={cancelHref}>Avbryt</Link>
        </Button>
      </div>
    </form>
  );
}
