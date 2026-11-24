'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageLoading } from '@/components/feedback/page-loading';
import { JobProfileForm } from '@/components/job-profiles/job-profile-form';
import { AppShell } from '@/components/layout/app-shell';
import { FadeIn } from '@/components/motion/fade-in';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthUser } from '@/hooks/use-auth-user';
import { useJobProfiles } from '@/hooks/use-job-profiles';
import { createJobProfile, listCollectiveAgreements } from '@/lib/api';
import type { PublicAgreement } from '@/lib/types';

export default function NewJobProfilePage() {
  const router = useRouter();
  const { user, userName, isLoading: authLoading } = useAuthUser();
  const { profiles } = useJobProfiles({ enabled: !!user, softFail: true });
  const [agreements, setAgreements] = useState<PublicAgreement[]>([]);

  const activeCount = profiles.filter((p) => p.archivedAt == null).length;
  const cap = user?.isPremium ? 5 : 1;
  const blockedReason =
    user && activeCount >= cap
      ? user.isPremium
        ? 'Du har redan 5 aktiva profiler. Arkivera en först.'
        : 'Gratisplan tillåter en profil. Uppgradera till Premium för fler.'
      : null;

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    void listCollectiveAgreements()
      .then((data) => {
        if (!cancelled) setAgreements(data);
      })
      .catch(() => {
        if (!cancelled) setAgreements([]);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (authLoading) {
    return <PageLoading label="Laddar…" userName={userName} />;
  }

  return (
    <AppShell userName={userName}>
      <FadeIn className="mx-auto w-full max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Skapa jobbprofil</CardTitle>
            <CardDescription>Ange timlön i kronor. Vi sparar den som öre.</CardDescription>
          </CardHeader>
          <CardContent>
            {blockedReason ? (
              <div className="mb-4 space-y-3 rounded-lg border border-border bg-muted/40 p-4">
                <p className="text-sm text-muted-foreground">{blockedReason}</p>
                <Button asChild variant="outline">
                  <Link href={user?.isPremium ? '/job-profiles' : '/premium'}>
                    {user?.isPremium ? 'Tillbaka till profiler' : 'Uppgradera till Premium'}
                  </Link>
                </Button>
              </div>
            ) : null}

            <JobProfileForm
              agreements={agreements}
              submitLabel="Skapa profil"
              disabled={!!blockedReason}
              showAgreementHint
              onSubmit={async (data) => {
                await createJobProfile({
                  name: data.name,
                  hourlyWage: data.hourlyWage,
                  taxRate: data.taxRate,
                  employerName: data.employerName ?? undefined,
                  isPrimary: data.isPrimary,
                  collectiveAgreementId: data.collectiveAgreementId,
                });
                router.push('/job-profiles');
              }}
            />

            <p className="mt-6 text-sm text-muted-foreground">
              <Link href="/job-profiles" className="underline-offset-4 hover:underline">
                Tillbaka till listan
              </Link>
            </p>
          </CardContent>
        </Card>
      </FadeIn>
    </AppShell>
  );
}
