'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/** Rast i UI: bara klockslag (HH:mm). Datum sätts från passet vid sparning. */
export interface BreakIntervalDraft {
  key: string;
  startTime: string;
  endTime: string;
}

interface BreakIntervalsEditorProps {
  value: BreakIntervalDraft[];
  onChange: (next: BreakIntervalDraft[]) => void;
  disabled?: boolean;
}

function newInterval(): BreakIntervalDraft {
  return { key: crypto.randomUUID(), startTime: '', endTime: '' };
}

/**
 * Koppla HH:mm till det kalenderdatum (start- eller slutdag) som ligger inom passfönstret.
 * Täcker nattpass utan att användaren behöver välja datum.
 */
function localDateTimeInShiftWindow(
  shiftStartLocal: string,
  shiftEndLocal: string,
  timeHm: string,
): Date {
  const startDay = shiftStartLocal.slice(0, 10);
  const endDay = shiftEndLocal.slice(0, 10);
  const shiftStart = new Date(shiftStartLocal);
  const shiftEnd = new Date(shiftEndLocal);

  const onStartDay = new Date(`${startDay}T${timeHm}`);
  if (onStartDay.getTime() >= shiftStart.getTime() && onStartDay.getTime() <= shiftEnd.getTime()) {
    return onStartDay;
  }

  if (endDay !== startDay) {
    const onEndDay = new Date(`${endDay}T${timeHm}`);
    if (onEndDay.getTime() >= shiftStart.getTime() && onEndDay.getTime() <= shiftEnd.getTime()) {
      return onEndDay;
    }
  }

  return onStartDay;
}

export default function BreakIntervalsEditor({
  value,
  onChange,
  disabled = false,
}: BreakIntervalsEditorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Rastintervall</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || value.length >= 20}
          onClick={() => onChange([...value, newInterval()])}
          className="gap-1"
        >
          <Plus className="size-4" />
          Lägg till rast
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Ange bara klockslag. Datumet hämtas från passets start/slut.
      </p>
      {value.length === 0 ? (
        <p className="text-xs text-muted-foreground">Ingen rast. Lägg till intervall vid behov.</p>
      ) : (
        value.map((row) => (
          <div key={row.key} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <Input
              type="time"
              value={row.startTime}
              disabled={disabled}
              onChange={(e) =>
                onChange(
                  value.map((r) => (r.key === row.key ? { ...r, startTime: e.target.value } : r)),
                )
              }
              aria-label="Rast starttid"
            />
            <Input
              type="time"
              value={row.endTime}
              disabled={disabled}
              onChange={(e) =>
                onChange(
                  value.map((r) => (r.key === row.key ? { ...r, endTime: e.target.value } : r)),
                )
              }
              aria-label="Rast sluttid"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={disabled}
              aria-label="Ta bort rast"
              onClick={() => onChange(value.filter((r) => r.key !== row.key))}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))
      )}
    </div>
  );
}

/** true om någon rad har bara start eller bara slut ifylld. */
export function hasIncompleteBreakDrafts(drafts: BreakIntervalDraft[]): boolean {
  return drafts.some((d) => Boolean(d.startTime) !== Boolean(d.endTime));
}

export function draftsToBreakIntervals(
  drafts: BreakIntervalDraft[],
  shiftStartLocal: string,
  shiftEndLocal: string,
): Array<{ startAt: string; endAt: string }> {
  if (hasIncompleteBreakDrafts(drafts)) {
    throw new Error('Fyll i både start och slut för varje rast, eller ta bort raden');
  }
  return drafts
    .filter((d) => d.startTime && d.endTime)
    .map((d) => {
      const startAt = localDateTimeInShiftWindow(shiftStartLocal, shiftEndLocal, d.startTime);
      const endAt = localDateTimeInShiftWindow(shiftStartLocal, shiftEndLocal, d.endTime);
      return {
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
      };
    });
}
