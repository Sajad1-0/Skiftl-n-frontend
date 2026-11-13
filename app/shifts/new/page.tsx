'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageError } from '@/components/feedback/page-error';
import { PageLoading } from '@/components/feedback/page-loading';
import { AppShell } from '@/components/layout/app-shell';
import { FadeIn } from '@/components/motion/fade-in';
import { ShiftForm } from '@/components/shifts/shift-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthUser } from '@/hooks/use-auth-user';
import { useJobProfiles } from '@/hooks/use-job-profiles';
import { createShift } from '@/lib/api';

export default function NewShiftPage() {
  const router = useRouter();
  const { user, userName, isLoading: authLoading } = useAuthUser();
  const {
    profiles,
    isLoading: profilesLoading,
    error: profilesError,
    primaryId,
  } = useJobProfiles({ enabled: !!user });

  const isPremium = user?.isPremium === true;
  const isLoading = authLoading || (!!user && profilesLoading);

  if (isLoading) {
    return <PageLoading label="Laddar…" userName={userName} />;
  }

  return (
    <AppShell userName={userName}>
      <FadeIn className="mx-auto w-full max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Logga Pass</CardTitle>
            <CardDescription>
              Timlön och brutto beräknas på servern utifrån vald jobbprofil
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profilesError ? (
              <PageError message={profilesError} variant="inline" />
            ) : profiles.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Du behöver en jobbprofil först.{' '}
                <Link href="/job-profiles/new" className="underline underline-offset-4">
                  Skapa en jobbprofil
                </Link>
              </p>
            ) : (
              <ShiftForm
                key={primaryId || 'new'}
                profiles={profiles}
                isPremium={isPremium}
                initialValues={{ jobProfileId: primaryId }}
                submitLabel="Spara pass"
                showEndFromStartHint
                onSubmit={async (data) => {
                  await createShift({
                    jobProfileId: data.jobProfileId,
                    startAt: data.startAt,
                    endAt: data.endAt,
                    ...(data.breakIntervals ? { breakIntervals: data.breakIntervals } : {}),
                    ...(data.breakMinutes != null ? { breakMinutes: data.breakMinutes } : {}),
                    ...(data.notes.length > 0 ? { notes: data.notes } : {}),
                  });
                  router.push('/shifts');
                }}
              />
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </AppShell>
  );
}
