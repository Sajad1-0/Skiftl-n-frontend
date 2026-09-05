'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState } from 'react';
import { login } from '@/app/lib/api';
import { saveToken } from '@/app/lib/auth-storage';

interface FormState {
  error: string | null;
}

const initialState: FormState = { error: null };

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      const email = String(formData.get('email') ?? '').trim();
      const password = String(formData.get('password') ?? '');

      try {
        const data = await login({ email, password });
        saveToken(data.token);
        router.push('/dashboard');
        return { error: null };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Inloggning misslyckades',
        };
      }
    },
    initialState,
  );
  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Logga in</h1>
      <p className="mt-2 text-sm text-foreground/70">Välkommen tillbaka till SkiftLön</p>

      <form action={formAction} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          E-post
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="example@email.com"
            className="rounded-md border border-foreground/15 bg-background px-3 py-2 text-base outline-none focus:border-foreground/40"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Lösenord
          <input
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete="current-password"
            placeholder="Ange ditt lösenord"
            className="rounded-md border border-foreground/15 bg-background px-3 py-2 text-base outline-none focus:border-foreground/40"
          />
        </label>

        {state.error ? (
          <p
            className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300"
            role="alert"
          >
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background disabled:opacity-60"
        >
          {isPending ? 'Loggar in…' : 'Logga in'}
        </button>
      </form>
      <p className="mt-6 text-sm text-foreground/70">
        Nytt konto?{' '}
        <Link
          href="/register"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Registrera
        </Link>
      </p>
    </main>
  );
}
