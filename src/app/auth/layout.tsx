// app/auth/layout.tsx

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden px-4 bg-[var(--color-brand-gray)]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-[350px] h-[350px] bg-[#4a6cff] opacity-20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[var(--color-brand-orange)] opacity-10 blur-[150px] rounded-full" />
      </div>
      <div className="relative w-full max-w-md bg-[var(--color-brand-gray-light)]/70 backdrop-blur-xl border border-[var(--color-brand-gray-softer)] rounded-xl p-8 shadow-xl">
        <div className="flex justify-center mb-6">
          <h1 className="text-3xl font-bold text-[var(--color-brand-text-primary)] tracking-wide">
            <span className="text-[var(--color-brand-orange)]">Otaku</span>
            Fusion
          </h1>
        </div>

        {children}
      </div>
    </div>
  );
}
