/**
 * När start ändras: kopiera till slut om slut är tomt eller fortfarande speglar förra starten.
 * Så användaren bara behöver justera tid (eller datum vid nattpass).
 */
export function syncEndAtFromStart(
  previousStartAt: string,
  nextStartAt: string,
  currentEndAt: string,
): string {
  if (!nextStartAt) return currentEndAt;
  if (!currentEndAt || currentEndAt === previousStartAt) return nextStartAt;
  return currentEndAt;
}
