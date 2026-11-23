// components/legal/legal-doc.tsx
import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { FadeIn } from '@/components/motion/fade-in';
import { SiteFooter } from '../layout/site-footer';
import { BRAND_NAME } from '@/lib/brand';

interface LegalDocProps {
  title: string;
  updatedLabel: string;
  children: React.ReactNode;
}

export function LegalDoc({ title, updatedLabel, children }: LegalDocProps) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,oklch(0.88_0.07_255)_0%,transparent_50%),linear-gradient(180deg,oklch(0.99_0.005_255),oklch(0.97_0.015_247))]"
      />
      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <Logo href="/" size="md" showWordmark />
        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Till startsidan
        </Link>
      </header>

      <FadeIn className="relative z-10 mx-auto w-full max-w-2xl flex-1 px-6 pb-12">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {BRAND_NAME}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{updatedLabel}</p>

        <div className="mt-4 rounded-lg border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Detta är en utgångspunkt för {BRAND_NAME} under mjuk lansering. Texten är{' '}
          <strong>inte juridisk rådgivning</strong>. Låt en jurist granska innan bredare
          marknadsföring eller Stripe live.
        </div>

        <article className="prose-legal mt-8 space-y-6 text-sm leading-relaxed text-foreground">
          {children}
        </article>
      </FadeIn>

      <SiteFooter className="relative z-10" />
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      <div className="space-y-2 text-muted-foreground">{children}</div>
    </section>
  );
}
