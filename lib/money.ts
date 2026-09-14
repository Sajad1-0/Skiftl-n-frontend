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
