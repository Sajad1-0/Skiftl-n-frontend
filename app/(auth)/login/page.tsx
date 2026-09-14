'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { FadeIn } from '@/components/motion/fade-in';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/lib/api';
import { saveToken } from '@/lib/auth-storage';

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
    <FadeIn>
      <Card className="border-border/60 shadow-lg shadow-primary/5">
        <CardHeader className="space-y-4 pb-4">
          <Logo href="/" size="lg" showWordmark />
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Välkommen tillbaka. Logga in.
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground">
                E-post
              </Label>
              <Input
                id="email"
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="namn@email.com"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-muted-foreground">
                Lösenord
              </Label>
              <Input
                id="password"
                type="password"
                name="password"
                required
                minLength={8}
                autoComplete="current-password"
                placeholder="Ditt lösenord"
                className="h-11"
              />
            </div>

            {state.error ? (
              <p
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                role="alert"
              >
                {state.error}
              </p>
            ) : null}

            <Button type="submit" disabled={isPending} size="lg" className="mt-1 h-11 w-full gap-2">
              {isPending ? 'Loggar in…' : 'Logga in'}
              <ArrowRight className="size-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Har du inget konto?{' '}
            <Link href="/register" className="font-medium text-foreground underline underline-offset-4">
              Skapa konto
            </Link>
          </p>
        </CardContent>
      </Card>
    </FadeIn>
  );
}
