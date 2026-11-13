import {
  prepareBreakIntervals,
  type BreakIntervalDraft,
} from '@/components/shifts/break-intervals-editor';
import { tryLocalInputToIso } from '@/lib/shift-datetime';
import type { BreakIntervalsDto } from '@/lib/types';

export interface ShiftFormValues {
  jobProfileId: string;
  startAt: string;
  endAt: string;
  breakMinutes: string;
  notes: string;
  intervals: BreakIntervalDraft[];
}

/** Klart API-payload efter klientvalidering (ISO-tider). */
export interface ShiftFormSubmitData {
  jobProfileId: string;
  startAt: string;
  endAt: string;
  breakMinutes?: number;
  breakIntervals?: BreakIntervalsDto[];
  notes: string;
}

export function emptyShiftFormValues(overrides?: Partial<ShiftFormValues>): ShiftFormValues {
  return {
    jobProfileId: '',
    startAt: '',
    endAt: '',
    breakMinutes: '0',
    notes: '',
    intervals: [],
    ...overrides,
  };
}

export function buildShiftSubmitData(
  values: ShiftFormValues,
  isPremium: boolean,
): { data: ShiftFormSubmitData } | { error: string } {
  if (!values.jobProfileId) {
    return { error: 'Välj en jobbprofil' };
  }

  if (!values.startAt || !values.endAt) {
    return { error: 'Ange start och slut tid' };
  }

  const startIso = tryLocalInputToIso(values.startAt);
  const endIso = tryLocalInputToIso(values.endAt);
  if (!startIso || !endIso) {
    return { error: 'Ogiltigt datum eller tid' };
  }
  if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
    return { error: 'Slut måste vara efter start tid' };
  }
  const notes = values.notes.trim();
  if (isPremium) {
    const prepared = prepareBreakIntervals(values.intervals, values.startAt, values.endAt);
    if ('error' in prepared) {
      return { error: prepared.error };
    }
    return {
      data: {
        jobProfileId: values.jobProfileId,
        startAt: startIso,
        endAt: endIso,
        breakIntervals: prepared.breakIntervals,
        notes,
      },
    };
  }

  const minutes = Number(values.breakMinutes);
  if (!Number.isFinite(minutes) || minutes < 0) {
    return { error: 'Rast måste vara >= 0 minuter' };
  }

  return {
    data: {
      jobProfileId: values.jobProfileId,
      startAt: startIso,
      endAt: endIso,
      breakMinutes: minutes,
      notes,
    },
  };
}
