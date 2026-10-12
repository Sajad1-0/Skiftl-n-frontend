import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';

/** Next.js 404 — sidan finns inte. */
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-12">
      <Logo href="/" size="lg" showWordmark />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Sidan hittades inte</h1>
        <p className="text-sm text-muted-foreground">
          Länken kan vara fel eller sidan har flyttats.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Till startsidan</Link>
      </Button>
    </main>
  );
}
