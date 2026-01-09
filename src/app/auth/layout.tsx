// app/auth/layout.tsx

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-[20px] min-h-screen w-full flex items-center justify-center relative overflow-hidden px-4 bg-[var((#213944)]">
      <h1 className="text-3xl font-bold text-[var(--color-brand-text-primary)] tracking-wide">
        <span className="text-[var(--color-brand-orange)]">Otaku</span>
        Fusion
      </h1>
      <div className="flex absolute pointer-events-none">
        <div className="absolute -top-20 -left-20 w-[350px] h-[350px] bg-[#4a6cff] opacity-20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[var(--color-brand-orange)] opacity-10 blur-[150px] rounded-full" />
      </div>
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
