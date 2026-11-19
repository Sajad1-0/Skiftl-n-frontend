// lib/premium-beta.ts
import type { PremiumSource } from '@/lib/types';

/** Formatera beta-deadline för svensk UI (Europe/Stockholm). */
export function formatPremiumBetaEndsAt(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function isPremiumBetaSource(source: PremiumSource | undefined): boolean {
  return source === 'beta';
}
