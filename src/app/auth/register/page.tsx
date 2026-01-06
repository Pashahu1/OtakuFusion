export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-white mb-2">Create Account</h2>

      <input
        type="email"
        placeholder="Email"
        className="bg-[var(--color-brand-gray-light)] text-[var(--color-brand-text-primary)] px-4 py-3 rounded-lg outline-none border border-transparent focus:border-[var(--color-brand-orange)] placeholder-[var(--color-brand-text-muted)]"
      />

      <input
        type="password"
        placeholder="Password"
        className="bg-[var(--color-brand-gray-light)] text-[var(--color-brand-text-primary)] px-4 py-3 rounded-lg outline-none border border-transparent focus:border-[var(--color-brand-orange)] placeholder-[var(--color-brand-text-muted)]"
      />

      <input
        type="password"
        placeholder="Confirm Password"
        className="bg-[var(--color-brand-gray-light)] text-[var(--color-brand-text-primary)] px-4 py-3 rounded-lg outline-none border border-transparent focus:border-[var(--color-brand-orange)] placeholder-[var(--color-brand-text-muted)]"
      />

      <button className="bg-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange-light)] transition text-[var(--color-brand-text-primary)] py-3 rounded-lg font-medium shadow-md shadow-[var(--color-brand-orange-light)]">
        Register
      </button>

      <a href="/auth/login" className="text-[#6d4aff] text-sm text-center mt-2">
        Already have an account?
      </a>
    </div>
  );
}
