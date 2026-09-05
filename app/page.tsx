import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col justify-center px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">SkiftLön</h1>
      <p className="mt-3 text-base text-foreground/70">
        Logga arbetstid och se din lön före och efter skatt.
      </p>

      <nav className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/register"
          className="rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background"
        >
          Skapa konto
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-foreground/20 px-4 py-2.5 text-sm font-medium text-foreground"
        >
          Logga in
        </Link>
        <Link
          href="/dashboard"
          className="rounded-md border border-foreground/20 px-4 py-2.5 text-sm font-medium text-foreground"
        >
          Dashboard
        </Link>
      </nav>
    </main>
  );
}
