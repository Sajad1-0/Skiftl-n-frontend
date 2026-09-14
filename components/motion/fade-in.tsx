'use client';

import { cn } from '@/lib/utils';

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}

/** Subtil fade + slide-up (React Bits-inspirerad). */
export function FadeIn({ children, className, delayMs = 0 }: FadeInProps) {
  return (
    <div
      className={cn('animate-fade-slide-up', className)}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}
