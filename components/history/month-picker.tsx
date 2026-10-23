'use client';

import {
  formatYearMonthSv,
  listSelectableMonths,
  yearMonthKey,
  type YearMonth,
} from '@/lib/month-bounds';
import { Label } from '@/components/ui/label';

interface MonthPickerProps {
  value: YearMonth;
  onChange: (ym: YearMonth) => void;
  // Max antal månader bakåt (Premium = 6)
  monthCount?: number;
  id?: string;
  label?: string;
  disabled?: boolean;
}

export function MonthPicker({
  value,
  onChange,
  monthCount = 6,
  id = 'month-picker',
  label = 'Månad',
  disabled = false,
}: MonthPickerProps) {
  const options = listSelectableMonths(new Date(), monthCount);

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        disabled={disabled}
        value={yearMonthKey(value)}
        onChange={(e) => {
          const [y, m] = e.target.value.split('-').map(Number);
          if (y && m) onChange({ year: y, month: m });
        }}
        className="flex h-10 w-full min-w-[12rem] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
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
