/** Local calendar month as ISO instants for the shifts API overlap filter. */
export function monthBounds(date: Date = new Date()): { from: string; to: string } {
  const from = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  const to = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { from: from.toISOString(), to: to.toISOString() };
}
