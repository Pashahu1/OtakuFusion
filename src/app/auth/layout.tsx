export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex w-full flex-1 flex-col items-center justify-center gap-6 overflow-hidden bg-[var(--color-brand-gray-dark)] px-4 pt-[calc(60px+max(1rem,env(safe-area-inset-top)))] pb-8 sm:gap-8 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(
              ellipse 85% 68% at 42% 36%,
              rgba(244, 117, 33, 0.14) 0%,
              rgba(160, 58, 32, 0.2) 32%,
              rgba(150, 52, 32, 0.06) 48%,
              transparent 64%
            ),
            radial-gradient(
              ellipse 74% 58% at 62% 60%,
              rgba(70, 32, 28, 0.38) 0%,
              rgba(35, 22, 20, 0.12) 46%,
              transparent 62%
            ),
            radial-gradient(
              ellipse 145% 128% at 50% 50%,
              transparent 0%,
              rgb(12 12 14 / 0.55) 58%,
              #0c0c0e 100%
            )
          `,
        }}
      />
      <h1 className="relative z-[1] text-center text-2xl font-bold tracking-[0.08em] text-[var(--color-brand-text-primary)] sm:text-3xl sm:tracking-[0.06em]">
        <span className="text-[var(--color-brand-orange)] drop-shadow-[0_0_28px_rgba(244,117,33,0.2)]">
          Otaku
        </span>
        Fusion
      </h1>
      <div className="relative z-[1] w-full max-w-md">{children}</div>
    </div>
  );
}
