'use client';

import { Input } from '@/components/ui/input';
import { TimeHmSelect } from '@/components/shifts/time-hm-select';
import { joinDatetimeLocal, splitDatetimeLocal } from '@/lib/shift-datetime';
import { cn } from '@/lib/utils';

interface DatetimeLocalFieldsProps {
  id: string;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

/**
 * Datum + tid (5-minuterssteg) som behåller formatet `YYYY-MM-DDTHH:mm`
 * (samma som datetime-local) så befintlig submit-logik fungerar.
 */
export function DatetimeLocalFields({
  id,
  value,
  onChange,
  disabled = false,
  required = false,
  className,
}: DatetimeLocalFieldsProps) {
  const { date, time } = splitDatetimeLocal(value);

  return (
    <div className={cn('grid gap-2 sm:grid-cols-[1.2fr_1fr]', className)}>
      <Input
        id={id}
        type="date"
        required={required}
        disabled={disabled}
        value={date}
        onChange={(e) => onChange(joinDatetimeLocal(e.target.value, time || '00:00'))}
        className="h-11"
      />
      <TimeHmSelect
        value={time}
        required={required}
        disabled={disabled}
        aria-label="Tid"
        onChange={(nextTime) => onChange(joinDatetimeLocal(date, nextTime))}
      />
    </div>
  );
}
