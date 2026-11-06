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

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** ISO → värde för `<input type="datetime-local">` i lokal tidzon. */
export function isoToDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** ISO → `HH:mm` i lokal tidzon (för rastfält). */
export function isoToTimeHm(iso: string): string {
  const d = new Date(iso);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** datetime-local → ISO UTC för API. */
export function localInputToIso(value: string): string {
  return new Date(value).toISOString();
}
