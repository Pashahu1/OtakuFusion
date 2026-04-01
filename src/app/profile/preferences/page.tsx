import { ChangePasswordForm } from '@/components/SettingsPage/ChangePasswordForm';
import { DeleteAccount } from '@/components/SettingsPage/DeleteAccount';

export default function SettingsProfile() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:gap-10 sm:py-10 md:px-0">
      <ChangePasswordForm />

      {/* Окрема зона: візуально й змістовно відділена від «звичайних» налаштувань */}
      <section
        className="pt-2 sm:pt-4"
        aria-labelledby="danger-zone-heading"
      >
        <div className="mb-6 flex items-center gap-3">
          <div
            className="h-px min-w-0 flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-zinc-700"
            aria-hidden
          />
          <h2
            id="danger-zone-heading"
            className="shrink-0 text-[10px] font-bold uppercase tracking-[0.22em] text-red-500/70"
          >
            Danger zone
          </h2>
          <div
            className="h-px min-w-0 flex-1 bg-gradient-to-l from-transparent via-zinc-700 to-zinc-700"
            aria-hidden
          />
        </div>
        <DeleteAccount />
      </section>
    </div>
  );
}
