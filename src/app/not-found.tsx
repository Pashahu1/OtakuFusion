'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-neutral-950 text-center text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-1/2 -top-1/2 h-[200%] w-[200%] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(220,38,38,0.25),transparent)] blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 h-[200%] w-[200%] bg-[radial-gradient(ellipse_60%_80%_at_80%_100%,rgba(251,146,60,0.15),transparent)] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_50%,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-2 px-4">
        <div className="animate-float">
          <Image
            width={400}
            height={200}
            src="/sukuna-404.png"
            alt="Page not found — 404 illustration"
            className="drop-shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-transform duration-300 hover:drop-shadow-[0_0_40px_rgba(220,38,38,0.7)]"
          />
        </div>

        <h1
          className="mt-4 bg-gradient-to-r from-red-500 via-orange-500 to-red-600 bg-clip-text text-8xl font-black tracking-[0.3em] text-transparent drop-shadow-[0_0_30px_rgba(220,38,38,0.4)] md:text-9xl"
          style={{
            textShadow:
              '2px 0 0 rgba(34,211,238,0.8), -2px 0 0 rgba(239,68,68,0.8), 0 0 20px rgba(220,38,38,0.5)',
          }}
        >
          404
        </h1>

        <p className="max-w-sm text-lg text-neutral-400 md:text-xl">
          Oops... The page you’re looking for doesn’t exist.
        </p>

        <button
          type="button"
          className="group relative mt-8 h-14 w-56 overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 px-6 text-lg font-semibold shadow-[0_0_30px_rgba(220,38,38,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(220,38,38,0.5)] active:scale-95"
          onClick={() => router.push('/')}
          aria-label="Return to Home Page"
        >
          <span className="relative z-10">Return Home</span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </button>
      </div>
    </div>
  );
}
