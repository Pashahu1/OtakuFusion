import { Eye, EyeOff, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  visible: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
  autoComplete: string;
  disabled?: boolean;
  mismatch?: boolean;
}

export function PasswordField({
  id,
  label,
  value,
  visible,
  onToggle,
  onChange,
  autoComplete,
  disabled,
  mismatch,
}: PasswordFieldProps) {
  return (
    <label className="profile-settings__field" htmlFor={id}>
      <span className="profile-settings__label">{label}</span>
      <div
        className={cn(
          'profile-settings__input-wrap',
          mismatch && 'profile-settings__input-wrap--error',
        )}
      >
        <Lock aria-hidden size={16} className="profile-settings__input-icon" />
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className="profile-settings__input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          disabled={disabled}
          placeholder="••••••••"
        />
        <button
          type="button"
          className="profile-settings__toggle"
          onClick={onToggle}
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </label>
  );
}
