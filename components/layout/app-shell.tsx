'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Briefcase, LayoutDashboard, LogOut, Clock, Menu, Search, X } from 'lucide-react';
import { useState, useTransition } from 'react';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { clearToken } from '@/lib/auth-storage';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/job-profiles', label: 'Jobbprofiler', icon: Briefcase },
  { href: '/shifts', label: 'Pass', icon: Clock },
] as const;

interface AppShellProps {
  children: React.ReactNode;
  userName?: string;
}

export function AppShell({ children, userName }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(() => {
      clearToken();
      router.push('/login');
    });
  }

  return (
    <div className="flex min-h-full bg-muted/40">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-svh w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-3 py-4 md:flex">
        <div className="px-2 pb-6">
          <Logo href="/dashboard" size="md" showWordmark />
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-sidebar-border pt-3">
          <div className="flex items-center gap-2 rounded-lg px-2 py-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {(userName ?? 'S').slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{userName ?? 'SkiftLön'}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleLogout}
              disabled={isPending}
              aria-label="Logga ut"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-md">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? 'Stäng meny' : 'Öppna meny'}
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
          <p className="hidden text-sm text-muted-foreground sm:block">Hem</p>
          <div className="mx-auto hidden w-full max-w-md md:block">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                readOnly
                placeholder="skiftlon.app"
                className="h-9 bg-muted/50 pl-9"
                aria-label="Sök"
              />
            </div>
          </div>
          <div className="ml-auto md:hidden">
            <Logo href="/dashboard" size="sm" showWordmark={false} />
          </div>
        </header>

        {mobileOpen ? (
          <div className="border-b border-border bg-card px-3 py-2 md:hidden">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium',
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted',
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={handleLogout}
                disabled={isPending}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-muted disabled:opacity-60"
              >
                <LogOut className="size-4" />
                Logga ut
              </button>
            </nav>
          </div>
        ) : null}

        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
