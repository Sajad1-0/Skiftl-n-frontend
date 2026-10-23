export const PREMIUM_HISTORY_MONTHS = 6;

export interface YearMonth {
  year: number;
  month: number;
}

/** Local calendar month as ISO instants for the shifts API overlap filter. */
export function monthBounds(date: Date = new Date()): { from: string; to: string } {
  const from = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  const to = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { from: from.toISOString(), to: to.toISOString() };
}

export function currentYearMonth(date: Date = new Date()): YearMonth {
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function monthBoundsFor(ym: YearMonth): { from: string; to: string } {
  return monthBounds(new Date(ym.year, ym.month - 1, 1));
}

export function yearMonthKey(ym: YearMonth): string {
  return `${ym.year}-${String(ym.month).padStart(2, '0')}`;
}

export function parseYearMonthKey(key: string): YearMonth | null {
  const m = /^(\d{4})-(\d{2})$/.exec(key);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (!year || month < 1 || month > 12) return null;
  return { year, month };
}

export function listSelectableMonths(
  now: Date = new Date(),
  count: number = PREMIUM_HISTORY_MONTHS,
): YearMonth[] {
  const out: YearMonth[] = [];
  let y = now.getFullYear();
  let m = now.getMonth() + 1;
  for (let i = 0; i < count; i++) {
    out.push({ year: y, month: m });
    m -= 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
  }
  return out;
}

export function formatYearMonthSv(ym: YearMonth): string {
  const d = new Date(ym.year, ym.month - 1, 1);
  return new Intl.DateTimeFormat('sv-SE', { year: 'numeric', month: 'long' }).format(d);
}
