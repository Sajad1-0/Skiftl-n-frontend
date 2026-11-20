/** UI visar kronor; API lagrar öre. */
export function kronorToOre(kronor: number): number {
  return Math.round(kronor * 100);
}

export function oreToKronor(ore: number): number {
  return ore / 100;
}

export function formatKronor(ore: number): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
  }).format(oreToKronor(ore));
}

/** Visa — när skatt/netto saknas (t.ex. ingen schablon och ingen tabell). */
export function formatOptionalKronor(ore: number | null | undefined): string {
  if (ore == null) return '—';
  return formatKronor(ore);
}
