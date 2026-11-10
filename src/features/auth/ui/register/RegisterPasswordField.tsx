import { useTranslation } from 'react-i18next';

import { UnderlineField } from '@/components/auth/underline-field';

const passwordToggleClassName =
  'touch-manipulation shrink-0 rounded-md border border-[var(--of-border-strong)] bg-transparent px-2.5 py-2 text-xs font-semibold tracking-wide text-[var(--of-text-muted)] uppercase transition-colors hover:border-[var(--of-accent)] hover:bg-[var(--of-fill)] hover:text-[var(--of-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-orange)]/40';

interface RegisterPasswordFieldProps {
  id: string;
  label: string;
  value: string;
  visible: boolean;
  hasError: boolean;
  placeholder: string;
  onToggle: () => void;
  onChange: (value: string) => void;
}

export function RegisterPasswordField({
  id,
  label,
  value,
  visible,
  hasError,
  placeholder,
  onToggle,
  onChange,
}: RegisterPasswordFieldProps) {
  const { t } = useTranslation('common');

  return (
    <UnderlineField id={id} label={label} hasError={hasError}>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete="new-password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={hasError}
          className="min-w-0 flex-1 bg-transparent px-0 py-2.5 text-[var(--color-brand-text-primary)] outline-none transition-colors placeholder:text-zinc-500"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={onToggle}
          className={passwordToggleClassName}
          aria-pressed={visible}
        >
          {visible ? t('actions.hide') : t('actions.show')}
        </button>
      </div>
    </UnderlineField>
  );
}
