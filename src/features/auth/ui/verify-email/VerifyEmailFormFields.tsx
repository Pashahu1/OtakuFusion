import { UnderlineField } from '@/components/auth/underline-field';
import { digitsOnly } from '@/features/auth/lib/verify-email-utils';
import { cn } from '@/lib/utils';

interface VerifyEmailFormFieldsProps {
  email: string;
  code: string;
  lockEmail: boolean;
  emailError: boolean;
  codeError: boolean;
  onEmailChange: (value: string) => void;
  onCodeChange: (value: string) => void;
}

export function VerifyEmailFormFields({
  email,
  code,
  lockEmail,
  emailError,
  codeError,
  onEmailChange,
  onCodeChange,
}: VerifyEmailFormFieldsProps) {
  return (
    <div className="space-y-1">
      <UnderlineField id="verify-email" label="Email address" hasError={emailError}>
        <input
          id="verify-email"
          type="email"
          autoComplete="email"
          value={email}
          readOnly={lockEmail}
          disabled={lockEmail}
          onChange={(e) => onEmailChange(e.target.value)}
          inputMode="email"
          className={cn(
            'w-full bg-transparent px-0 py-2 text-[var(--color-brand-text-primary)] outline-none placeholder:text-zinc-500',
            lockEmail && 'cursor-default opacity-80',
          )}
          placeholder=""
        />
      </UnderlineField>

      <div
        className={cn(
          'rounded-xl border px-4 pb-3 pt-1 transition-colors duration-200',
          codeError
            ? 'border-red-500/80 bg-red-950/20'
            : 'border-zinc-700/80 bg-zinc-950/40 focus-within:border-[var(--color-brand-orange)]/60 focus-within:shadow-[0_0_0_1px_rgba(244,117,33,0.15)]',
        )}
      >
        <label
          htmlFor="verify-code"
          className={cn(
            'mb-1 block text-xs font-medium tracking-wide',
            codeError ? 'text-red-400' : 'text-[var(--color-brand-orange)]',
          )}
        >
          6-digit code
        </label>
        <input
          id="verify-code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => onCodeChange(digitsOnly(e.target.value, 6))}
          className="w-full bg-transparent py-2 text-center font-mono text-[1.65rem] tracking-[0.45em] text-[var(--color-brand-text-primary)] outline-none placeholder:text-zinc-600 sm:text-3xl sm:tracking-[0.5em]"
          placeholder="••••••"
          aria-label="Six digit verification code"
          aria-invalid={codeError}
        />
      </div>
    </div>
  );
}
