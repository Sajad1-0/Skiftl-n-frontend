'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageError } from '@/components/feedback/page-error';
import { PageLoading } from '@/components/feedback/page-loading';
import { JobProfileForm } from '@/components/job-profiles/job-profile-form';
import { AppShell } from '@/components/layout/app-shell';
import { FadeIn } from '@/components/motion/fade-in';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthUser } from '@/hooks/use-auth-user';
import { getJobProfile, listCollectiveAgreements, updateJobProfile } from '@/lib/api';
import { jobProfileToFormDefaults } from '@/lib/job-profile-form';
import type { PublicAgreement, PublicJobProfile } from '@/lib/types';

export default function EditJobProfilePage() {
  const params = useParams<{ id: string }>();
  const profileId = params.id;
  const router = useRouter();
  const { user, userName, isLoading: authLoading } = useAuthUser();

  const [profile, setProfile] = useState<PublicJobProfile | null>(null);
  const [agreements, setAgreements] = useState<PublicAgreement[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !profileId) return;

    let cancelled = false;

    async function load() {
      try {
        const [profileData, agreementData] = await Promise.all([
          getJobProfile(profileId),
          listCollectiveAgreements().catch(() => [] as PublicAgreement[]),
        ]);
        if (!cancelled) {
          setProfile(profileData);
          setAgreements(agreementData);
          setLoadError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'Kunde inte ladda profil');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [user, profileId]);

  if (authLoading || (user && loading)) {
    return <PageLoading label="Laddar…" userName={userName} />;
  }

  if (loadError || !profile) {
    return (
      <PageError
        variant="page"
        userName={userName}
        message={loadError ?? 'Profilen hittades inte'}
        action={
          <Link href="/job-profiles" className="text-sm underline-offset-4 hover:underline">
            Tillbaka till listan
          </Link>
        }
      />
    );
  }

  const knownAgreementIds = new Set(agreements.map((a) => a.id));
  const orphanAgreementId =
    profile.collectiveAgreementId && !knownAgreementIds.has(profile.collectiveAgreementId)
      ? profile.collectiveAgreementId
      : null;

  return (
    <AppShell userName={userName}>
      <FadeIn className="mx-auto w-full max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Redigera jobbprofil</CardTitle>
            <CardDescription>
              Ändringar gäller nya pass. Gamla pass behåller sina löne-snapshots.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JobProfileForm
              key={profile.id}
              agreements={agreements}
              initialValues={jobProfileToFormDefaults(profile)}
              orphanAgreementId={orphanAgreementId}
              submitLabel="Spara ändringar"
              onSubmit={async (data) => {
                await updateJobProfile(profileId, {
                  name: data.name,
                  hourlyWage: data.hourlyWage,
                  taxRate: data.taxRate,
                  employerName: data.employerName,
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
