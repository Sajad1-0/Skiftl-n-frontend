import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { FadeIn } from '@/components/motion/fade-in';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="relative flex min-h-full flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,oklch(0.88_0.07_255)_0%,transparent_50%),radial-gradient(ellipse_at_80%_80%,oklch(0.92_0.05_200)_0%,transparent_45%),linear-gradient(180deg,oklch(0.98_0.01_255),oklch(0.96_0.02_247))]"
      />
      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <Logo size="lg" showWordmark />
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/login">Logga in</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Skapa konto</Link>
          </Button>
        </div>
      </header>
      <FadeIn className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 pb-20">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          SkiftLön
        </h1>
        <p className="mt-4 max-w-lg text-base text-muted-foreground md:text-lg">
          Logga arbetstid och se din lön före och efter skatt — lugnt, tydligt och byggt för
          skiftarbete.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" className="h-11">
            <Link href="/register">Kom igång</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-11">
            <Link href="/login">Jag har redan konto</Link>
          </Button>
        </div>
      </FadeIn>
    </main>
  );
}
