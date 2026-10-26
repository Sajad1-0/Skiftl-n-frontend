'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { PageError } from '@/components/feedback/page-error';
import { PageLoading } from '@/components/feedback/page-loading';
import { AppShell } from '@/components/layout/app-shell';
import { FadeIn } from '@/components/motion/fade-in';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthUser } from '@/hooks/use-auth-user';
import { createBulkShifts, listJobProfiles } from '@/lib/api';
import type { PublicJobProfile } from '@/lib/types';

const MAX_ROWS = 10;

interface BulkRow {
  key: string;
  startAt: string;
  endAt: string;
  breakMinutes: string;
  notes: string;
}

function emptyRow(): BulkRow {
  return {
    key: crypto.randomUUID(),
    startAt: '',
    endAt: '',
    breakMinutes: '0',
    notes: '',
  };
}

function localInputToIso(value: string): string {
  return new Date(value).toISOString();
}

export default function BulkShiftsPage() {
  const router = useRouter();
  const { user, userName, isLoading: authLoading } = useAuthUser();
  const [profiles, setProfiles] = useState<PublicJobProfile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [profilesError, setProfilesError] = useState<string | null>(null);
  const [jobProfileId, setJobProfileId] = useState('');
  const [rows, setRows] = useState<BulkRow[]>([emptyRow()]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function loadProfiles() {
      try {
        const list = await listJobProfiles();
        if (cancelled) return;
        setProfiles(list);
        const primary = list.find((p) => p.isPrimary)?.id ?? list[0]?.id ?? '';
        setJobProfileId(primary);
        setProfilesError(null);
      } catch (error: unknown) {
        if (!cancelled) {
          setProfilesError(
            error instanceof Error ? error.message : 'Kunde inte ladda jobbprofiler',
          );
        }
      } finally {
        if (!cancelled) setProfilesLoading(false);
      }
    }

    void loadProfiles();
    return () => {
      cancelled = true;
    };
  }, [user]);

  function updateRow(key: string, patch: Partial<BulkRow>) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function addRow() {
    setRows((current) => (current.length >= MAX_ROWS ? current : [...current, emptyRow()]));
  }

  function removeRow(key: string) {
    setRows((current) =>
      current.length <= 1 ? current : current.filter((row) => row.key !== key),
    );
  }
  return (
    <div>
      <h1>BulkShiftsPage page</h1>
    </div>
  );
}
