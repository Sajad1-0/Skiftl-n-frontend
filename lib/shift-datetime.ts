/** Minuter som visas i tidväljare (klockslag): 00, 05, 10, … 55. */
export const FIVE_MINUTE_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as const;



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

export function pad2Minute(n: number): string {
  return pad2(n);
}

/** ISO → värde för datetime-local-format `YYYY-MM-DDTHH:mm` i lokal tidzon. */
export function isoToDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** ISO → `HH:mm` i lokal tidzon (för rastfält). */
export function isoToTimeHm(iso: string): string {
  const d = new Date(iso);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** datetime-local → ISO UTC för API. Kastar om värdet är ogiltigt. */
export function localInputToIso(value: string): string {
  const iso = tryLocalInputToIso(value);
  if (!iso) {
    throw new Error('Ogiltigt datum/tid');
  }
  return iso;
}

/** datetime-local → ISO UTC, eller null om ogiltigt. */
export function tryLocalInputToIso(value: string): string | null {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function splitDatetimeLocal(value: string): { date: string; time: string } {
  if (!value || !value.includes('T')) return { date: '', time: '' };
  const [date, timePart] = value.split('T');
  const time = (timePart ?? '').slice(0, 5);
  return { date: date ?? '', time };
}

export function joinDatetimeLocal(date: string, time: string): string {
  if (!date || !time) return date ? `${date}T` : '';
  return `${date}T${time}`;
}

export function splitTimeHm(value: string): { hour: string; minute: string } {
  if (!value || !value.includes(':')) return { hour: '', minute: '' };
  const [hour, minute] = value.split(':');
  return { hour: hour ?? '', minute: (minute ?? '').slice(0, 2) };
}

export function joinTimeHm(hour: string, minute: string): string {
  if (!hour || !minute) return '';
  return `${hour}:${minute}`;
}
