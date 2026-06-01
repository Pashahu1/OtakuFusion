import { UnderlineField } from '@/components/auth/underline-field';

import type { InvalidFields } from '@/features/auth/lib/register-field-errors';

import { RegisterPasswordField } from './RegisterPasswordField';

interface RegisterFormFieldsProps {
  username: string;
  email: string;
  password: string;
  confirm: string;
  invalidFields: InvalidFields;
  showPassword: boolean;
  showConfirm: boolean;
  onUsernameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmChange: (value: string) => void;
  onTogglePassword: () => void;
  onToggleConfirm: () => void;
}

export function RegisterFormFields({
  username,
  email,
  password,
  confirm,
  invalidFields,
  showPassword,
  showConfirm,
  onUsernameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmChange,
  onTogglePassword,
  onToggleConfirm,
}: RegisterFormFieldsProps) {
  return (
    <>
      <UnderlineField
        id="register-username"
        label="Username"
        hasError={Boolean(invalidFields.username)}
      >
        <input
          id="register-username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          aria-invalid={Boolean(invalidFields.username)}
          className="w-full bg-transparent px-0 py-2.5 text-[var(--color-brand-text-primary)] outline-none transition-colors placeholder:text-zinc-500"
          placeholder="username"
        />
      </UnderlineField>

      <UnderlineField
        id="register-email"
        label="Email"
        hasError={Boolean(invalidFields.email)}
      >
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          aria-invalid={Boolean(invalidFields.email)}
          className="w-full bg-transparent px-0 py-2.5 text-[var(--color-brand-text-primary)] outline-none transition-colors placeholder:text-zinc-500"
          placeholder="mail@example.com"
        />
      </UnderlineField>

      <RegisterPasswordField
        id="register-password"
        label="Password"
        value={password}
        visible={showPassword}
        hasError={Boolean(invalidFields.password)}
        placeholder="password"
        onToggle={onTogglePassword}
        onChange={onPasswordChange}
      />

      <RegisterPasswordField
        id="register-confirm"
        label="Confirm Password"
        value={confirm}
        visible={showConfirm}
        hasError={Boolean(invalidFields.confirm)}
        placeholder="confirm password"
        onToggle={onToggleConfirm}
        onChange={onConfirmChange}
      />
    </>
  );
}
