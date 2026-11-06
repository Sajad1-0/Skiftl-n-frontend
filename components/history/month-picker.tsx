'use client';

import {
  formatYearMonthSv,
  listSelectableMonths,
  yearMonthKey,
  type YearMonth,
} from '@/lib/month-bounds';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface MonthPickerProps {
  value: YearMonth;
  onChange: (ym: YearMonth) => void;
  /** Max antal månader bakåt (Premium = 6) */
  monthCount?: number;
  id?: string;
  label?: string;
  /** Dölj synlig label (behålls för skärmläsare) — bra bredvid knappar i toolbar */
  compact?: boolean;
  disabled?: boolean;
  className?: string;
}

export function MonthPicker({
  value,
  onChange,
  monthCount = 6,
  id = 'month-picker',
  label = 'Månad',
  compact = false,
  disabled = false,
  className,
}: MonthPickerProps) {
  const options = listSelectableMonths(new Date(), monthCount);

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={id} className={compact ? 'sr-only' : undefined}>
        {label}
      </Label>
      <select
        id={id}
        disabled={disabled}
        value={yearMonthKey(value)}
        onChange={(e) => {
          const [y, m] = e.target.value.split('-').map(Number);
          if (y && m) onChange({ year: y, month: m });
        }}
        className="flex h-8 min-w-[11rem] rounded-lg border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
      >
        {options.map((ym) => (
          <option key={yearMonthKey(ym)} value={yearMonthKey(ym)}>
            {formatYearMonthSv(ym)}
          </option>
        ))}
      </select>
    </div>
  );
}
