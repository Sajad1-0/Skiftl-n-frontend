'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface BreakIntervalDraft {
  key: string;
  startAt: string;
  endAt: string;
}

interface BreakIntervalsEditorProps {
  value: BreakIntervalDraft[];
  onChange: (next: BreakIntervalDraft[]) => void;
  disabled?: boolean;
}

function newInterval(): BreakIntervalDraft {
  return { key: crypto.randomUUID(), startAt: '', endAt: '' };
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
      {value.length === 0 ? (
        <p className="text-xs text-muted-foreground">Ingen rast. Lägg till intervall vid behov.</p>
      ) : (
        value.map((row) => (
          <div key={row.key} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <Input
              type="datetime-local"
              value={row.startAt}
              disabled={disabled}
              onChange={(e) =>
                onChange(
                  value.map((r) => (r.key === row.key ? { ...r, startAt: e.target.value } : r)),
                )
              }
              aria-label="Rast start"
            />
            <Input
              type="datetime-local"
              value={row.endAt}
              disabled={disabled}
              onChange={(e) =>
                onChange(
                  value.map((r) => (r.key === row.key ? { ...r, endAt: e.target.value } : r)),
                )
              }
              aria-label="Rast slut"
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
  return drafts.some((d) => Boolean(d.startAt) !== Boolean(d.endAt));
}

export function draftsToBreakIntervals(
  drafts: BreakIntervalDraft[],
): Array<{ startAt: string; endAt: string }> {
  if (hasIncompleteBreakDrafts(drafts)) {
    throw new Error('Fyll i både start och slut för varje rast, eller ta bort raden');
  }
  return drafts
    .filter((d) => d.startAt && d.endAt)
    .map((d) => ({
      startAt: new Date(d.startAt).toISOString(),
      endAt: new Date(d.endAt).toISOString(),
    }));
}
