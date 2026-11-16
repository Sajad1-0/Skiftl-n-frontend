'use client';

import {
  FIVE_MINUTE_OPTIONS,
  joinTimeHm,
  pad2Minute,
  splitTimeHm,
} from '@/lib/shift-datetime';
import { cn } from '@/lib/utils';

const selectClassName =
  'flex h-11 w-full min-w-0 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => pad2Minute(hour));

interface TimeHmSelectProps {
  id?: string;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  required?: boolean;
  'aria-label'?: string;
  className?: string;
}

/**
 * Timme + minut med bara 5-minuterssteg (00, 05, … 55).
 * Native time/datetime-local ignorerar ofta step i UI — därför egna selects.
 */
export function TimeHmSelect({
  id,
  value,
  onChange,
  disabled = false,
  required = false,
  'aria-label': ariaLabel,
  className,
}: TimeHmSelectProps) {
  const { hour, minute } = splitTimeHm(value);
  const minuteNum = minute === '' ? NaN : Number(minute);
  const minuteInList =
    Number.isFinite(minuteNum) &&
    FIVE_MINUTE_OPTIONS.includes(minuteNum as (typeof FIVE_MINUTE_OPTIONS)[number]);

  function setHour(nextHour: string) {
    const nextMinute = minute || '00';
    onChange(joinTimeHm(nextHour, nextMinute));
  }

  function setMinute(nextMinute: string) {
    const nextHour = hour || '00';
    onChange(joinTimeHm(nextHour, nextMinute));
  }

  return (
    <div className={cn('grid grid-cols-2 gap-2', className)} role="group" aria-label={ariaLabel}>
      <select
        id={id}
        aria-label={ariaLabel ? `${ariaLabel} timme` : 'Timme'}
        required={required}
        disabled={disabled}
        value={hour}
        onChange={(e) => setHour(e.target.value)}
        className={selectClassName}
      >
        <option value="" disabled>
          Timme
        </option>
        {HOUR_OPTIONS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <select
        aria-label={ariaLabel ? `${ariaLabel} minut` : 'Minut'}
        required={required}
        disabled={disabled}
        value={minute}
        onChange={(e) => setMinute(e.target.value)}
        className={selectClassName}
      >
        <option value="" disabled>
          Minut
        </option>
        {!minuteInList && minute ? (
          <option value={minute}>{minute} (befintlig)</option>
        ) : null}
        {FIVE_MINUTE_OPTIONS.map((m) => {
          const label = pad2Minute(m);
          return (
            <option key={label} value={label}>
              {label}
            </option>
          );
        })}
      </select>
    </div>
  );
}
