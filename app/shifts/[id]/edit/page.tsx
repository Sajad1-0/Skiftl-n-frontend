'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageError } from '@/components/feedback/page-error';
import { PageLoading } from '@/components/feedback/page-loading';
import { AppShell } from '@/components/layout/app-shell';
import { FadeIn } from '@/components/motion/fade-in';
import { breakIntervalsToDrafts } from '@/components/shifts/break-intervals-editor';
import { ShiftForm } from '@/components/shifts/shift-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthUser } from '@/hooks/use-auth-user';
import { useJobProfiles } from '@/hooks/use-job-profiles';
import { getJobProfile, getShift, updateShift } from '@/lib/api';
import { isoToDatetimeLocal } from '@/lib/shift-datetime';
import type { ShiftFormValues } from '@/lib/shift-form';
import type { PublicJobProfile } from '@/lib/types';

/** Fallback i select om getJobProfile misslyckas (t.ex. arkiverad/tillfällig fel). */
function stubJobProfile(id: string): PublicJobProfile {
  return {
    id,
    userId: '',
    name: 'Okänd profil',
    hourlyWage: 0,
    taxRate: 0,
    employerName: null,
    isPrimary: false,
    collectiveAgreementId: null,
    archivedAt: null,
    createdAt: '',
  };
}

export default function EditShiftPage() {
  const params = useParams<{ id: string }>();
  const shiftId = params.id;
  const router = useRouter();
  const { user, userName, isLoading: authLoading } = useAuthUser();
  const {
    profiles,
    setProfiles,
    isLoading: profilesLoading,
    error: profilesError,
  } = useJobProfiles({ enabled: !!user });

  const [shiftLoading, setShiftLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [profileWarning, setProfileWarning] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<ShiftFormValues | null>(null);

  useEffect(() => {
    if (!user || !shiftId || profilesLoading) return;

    let cancelled = false;

    async function loadShift() {
      try {
        const shift = await getShift(shiftId);
        if (cancelled) return;

        try {
          const owned = await getJobProfile(shift.jobProfileId);
          if (!cancelled) {
            setProfiles((current) =>
              current.some((p) => p.id === owned.id) ? current : [...current, owned],
            );
            setProfileWarning(null);
          }
        } catch {
          if (!cancelled) {
            setProfiles((current) =>
              current.some((p) => p.id === shift.jobProfileId)
                ? current
                : [...current, stubJobProfile(shift.jobProfileId)],
            );
            setProfileWarning(
              'Kunde inte hämta jobbprofilen. Kontrollera valet innan du sparar.',
            );
          }
        }

        if (!cancelled) {
          setInitialValues({
            jobProfileId: shift.jobProfileId,
            startAt: isoToDatetimeLocal(shift.startAt),
            endAt: isoToDatetimeLocal(shift.endAt),
            breakMinutes: String(shift.breakMinutes),
            notes: shift.notes ?? '',
            intervals: breakIntervalsToDrafts(shift.breakIntervals),
          });
          setLoadError(null);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Kunde inte ladda passet');
        }
      } finally {
        if (!cancelled) setShiftLoading(false);
      }
    }

    void loadShift();
    return () => {
      cancelled = true;
    };
  }, [user, shiftId, profilesLoading, setProfiles]);

  const isPremium = user?.isPremium === true;
  const isLoading = authLoading || (!!user && (profilesLoading || shiftLoading));
  const hasSelectedProfile =
    !!initialValues && profiles.some((p) => p.id === initialValues.jobProfileId);

  if (isLoading) {
    return <PageLoading label="Laddar pass…" userName={userName} />;
  }

  return (
    <AppShell userName={userName}>
      <FadeIn className="mx-auto w-full max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Redigera pass</CardTitle>
            <CardDescription>
              Ändringar räknar om brutto och OB utifrån vald jobbprofil
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadError || profilesError ? (
              <PageError message={loadError ?? profilesError ?? ''} variant="inline" />
            ) : !initialValues || !hasSelectedProfile ? (
              <p className="text-sm text-muted-foreground">
                Ingen jobbprofil tillgänglig.{' '}
                <Link href="/job-profiles/new" className="underline underline-offset-4">
                  Skapa en jobbprofil
                </Link>
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {profileWarning ? <PageError message={profileWarning} variant="inline" /> : null}
                <ShiftForm
                  key={shiftId}
                  profiles={profiles}
                  isPremium={isPremium}
                  initialValues={initialValues}
                  submitLabel="Spara ändringar"
                  onSubmit={async (data) => {
                    await updateShift(shiftId, {
                      jobProfileId: data.jobProfileId,
                      startAt: data.startAt,
                      endAt: data.endAt,
                      ...(data.breakIntervals ? { breakIntervals: data.breakIntervals } : {}),
                      ...(data.breakMinutes != null ? { breakMinutes: data.breakMinutes } : {}),
                      notes: data.notes.length > 0 ? data.notes : null,
                    });
                    router.push('/shifts');
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </AppShell>
  );
}
