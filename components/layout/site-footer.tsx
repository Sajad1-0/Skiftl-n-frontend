import Link from 'next/link';
import { BRAND_NAME } from '@/lib/brand';
import { cn } from '@/lib/utils';

interface SiteFooterProps {
  className?: string;
}

export function SiteFooter({ className }: SiteFooterProps) {
  return (
    <footer
      className={cn(
        'mt-auto border-t border-border/60 bg-card/40 px-6 py-6 text-sm text-muted-foreground',
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {BRAND_NAME}
        </p>
        <nav className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Juridik">
          <Link
            href="/privacy"
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            Integritetspolicy
          </Link>
          <Link href="/terms" className="underline-offset-4 hover:text-foreground hover:underline">
            Villkor
          </Link>
        </nav>
      </div>
    </footer>
  );
}
