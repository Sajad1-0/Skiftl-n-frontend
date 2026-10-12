/**
 * Next.js Suspense-fallback medan route-segmentet laddas.
 * Visas vid navigering — ersätter inte PageLoading i client-fetch.
 */
export default function Loading() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-1 items-center justify-center px-4 py-12">
      <p className="text-sm text-muted-foreground">Laddar…</p>
    </main>
  );
}
