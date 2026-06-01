export function VerifyEmailFormHeader() {
  return (
    <>
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--color-brand-orange)]/25 bg-[var(--color-brand-orange)]/10 shadow-[0_0_32px_-4px_rgba(244,117,33,0.35)]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-7 w-7 text-[var(--color-brand-orange)]"
          aria-hidden
        >
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <path d="m22 6-10 7L2 6" />
        </svg>
      </div>

      <h2
        id="verify-email-modal-title"
        className="mb-2 text-center font-serif text-2xl font-normal tracking-tight text-white sm:text-[1.65rem]"
      >
        Verify your email
      </h2>

      <p className="mx-auto mb-6 max-w-[32ch] text-center text-sm leading-relaxed text-zinc-400">
        We sent a 6-digit code to your inbox. Paste it below — check spam if you don&apos;t see
        it.
      </p>
    </>
  );
}
