import Link from 'next/link';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { cn } from '@/lib/utils';

interface PageErrorProps {
  message: ReactNode;
  variant?: 'inline' | 'alert' | 'page';
  userName?: string;
  action?: ReactNode;
  className?: string;
}

export function PageError({
  message,
  variant = 'alert',
  userName,
  action,
  className,
}: PageErrorProps) {
  const body =
    variant === 'inline' ? (
      <p className={cn('text-sm text-destructive', className)} role="alert">
        {message}
      </p>
    ) : (
      <p
        className={cn(
          'rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive',
          className,
        )}
        role="alert"
      >
        {message}
      </p>
    );

  if (variant === 'page') {
    return (
      <AppShell userName={userName}>
        {body}
        {action ? <div className="mt-4">{action}</div> : null}
      </AppShell>
    );
  }

  return body;
}

interface AuthRequiredProps {
  error?: string | null;
}

/** Visa när användaren inte är inloggad / user saknas. */
export function AuthRequired({ error }: AuthRequiredProps) {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col justify-center gap-4 px-4 py-12">
      {error ? <PageError message={error} variant="inline" /> : null}
      <Link href="/login" className="text-sm font-medium underline-offset-4 hover:underline">
        Logga in
      </Link>
    </main>
  );
}
