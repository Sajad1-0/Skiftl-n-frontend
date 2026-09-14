export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-full flex-1 items-center justify-center overflow-hidden px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,oklch(0.85_0.08_255)_0%,transparent_50%),radial-gradient(ellipse_at_80%_30%,oklch(0.88_0.07_300)_0%,transparent_45%),radial-gradient(ellipse_at_50%_90%,oklch(0.9_0.06_200)_0%,transparent_50%),linear-gradient(160deg,oklch(0.93_0.04_255),oklch(0.95_0.03_20))]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-6 rounded-3xl border border-white/40 bg-white/25 shadow-sm backdrop-blur-[2px] md:inset-12"
      />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
