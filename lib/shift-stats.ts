import type { PublicShift } from './types';

export interface ShiftMonthStats {
  totalMinutes: number;
  totalBreakMinutes: number;
  totalGrossOre: number;
  hours: number;
  goalProgress: number;
  shiftCount: number;
}

export function summarizeShifts(
  shifts: PublicShift[],
  goalOre: number | null | undefined,
): ShiftMonthStats {
  const totalMinutes = shifts.reduce((sum, shift) => sum + shift.workedMinutes, 0);
  const totalBreakMinutes = shifts.reduce((sum, shift) => sum + shift.breakMinutes, 0);
  const totalGrossOre = shifts.reduce((sum, shift) => sum + shift.grossOre, 0);
  const hours = totalMinutes / 60;
  const goalProgress =
    goalOre && goalOre > 0 ? Math.min(100, Math.round((totalGrossOre / goalOre) * 100)) : 0;

  return {
    totalMinutes,
    totalBreakMinutes,
    totalGrossOre,
    hours,
    goalProgress,
    shiftCount: shifts.length,
  };
}

// Referens för månadsöversikt (kan senare komma från settings)
export const MONTHLY_HOUR_TARGET = 160;
