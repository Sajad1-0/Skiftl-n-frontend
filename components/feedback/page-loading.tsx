import { AppShell } from '@/components/layout/app-shell';

interface PageLoadingProps {
  label?: string;
  userName?: string;
}

export function PageLoading({ label = 'Laddar…', userName }: PageLoadingProps) {
  return (
    <AppShell userName={userName}>
      <p className="text-sm text-muted-foreground">{label}</p>
    </AppShell>
  );
}
