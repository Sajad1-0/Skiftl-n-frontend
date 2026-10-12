'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Next.js Error Boundary för oväntade throws under root layout.
 * Complementation till PageError (som hanterar catchad API-state).
 */
export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Route error:', error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-12">
      <Logo href="/" size="lg" showWordmark />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Något gick fel</h1>
        <p className="text-sm text-muted-foreground">
          Ett oväntat fel uppstod. Du kan försöka igen eller gå tillbaka till startsidan.
        </p>
        {error.digest ? (
          <p className="font-mono text-xs text-muted-foreground">Kod: {error.digest}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={reset}>
          Försök igen
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Till dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
