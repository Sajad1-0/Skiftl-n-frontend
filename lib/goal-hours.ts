import { formatKronor } from './money';

export function formatHoursToGoal(
  summary: {
    goalOre: number | null;
    goalRemainingOre: number | null;
    hoursToGoalEstimate: number | null;
  },
  opts?: {
    /** t.ex. "denna månad" eller "mars 2026" */
    periodLabel?: string;
  },
): string | null {
  if (summary.goalOre == null) return null;

  const period = opts?.periodLabel ?? 'denna månad';

  if (summary.goalRemainingOre === 0) {
    return `Målet är nått ${period}`;
  }

  if (summary.hoursToGoalEstimate == null) {
    if (summary.goalRemainingOre != null) {
      return `${formatKronor(summary.goalRemainingOre)} kvar — kunde inte uppskatta timmar (saknar timlön/netto)`;
    }
    return null;
  }

  const hours = summary.hoursToGoalEstimate;
  const hoursLabel = Number.isInteger(hours) ? `${hours}` : hours.toFixed(1).replace('.', ',');

  if (summary.goalRemainingOre != null) {
    return `Ca ${hoursLabel} h kvar (${formatKronor(summary.goalRemainingOre)})`;
  }

  return `Ca ${hoursLabel} h kvar till målet`;
}
