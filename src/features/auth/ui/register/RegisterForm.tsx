'use client';

import { useTranslation } from 'react-i18next';

import { RegisterFormFields } from './RegisterFormFields';
import { useRegisterForm } from './useRegisterForm';

export function RegisterForm() {
  const {
    email,
    password,
    username,
    confirm,
    invalidFields,
    loading,
    showPassword,
    showConfirm,
    setShowPassword,
    setShowConfirm,
    setUsername,
    setEmail,
    setPassword,
    setConfirm,
    clearInvalid,
    loginHref,
    handleRegister,
  } = useRegisterForm();
  const { t } = useTranslation('common');

  return (
    <form
      onSubmit={handleRegister}
      className="flex flex-col gap-1 p-4 sm:gap-2 sm:p-8"
      noValidate
    >
      <h2 className="mb-5 text-center font-serif text-xl font-normal tracking-tight text-foreground sm:text-2xl">
        {t('auth.createAccount')}
      </h2>

      <RegisterFormFields
        username={username}
        email={email}
        password={password}
        confirm={confirm}
        invalidFields={invalidFields}
        showPassword={showPassword}
        showConfirm={showConfirm}
        onUsernameChange={(value) => {
          setUsername(value);
          clearInvalid('username');
        }}
        onEmailChange={(value) => {
          setEmail(value);
          clearInvalid('email');
        }}
        onPasswordChange={(value) => {
          setPassword(value);
          clearInvalid('password');
          clearInvalid('confirm');
        }}
        onConfirmChange={(value) => {
          setConfirm(value);
          clearInvalid('confirm');
        }}
        onTogglePassword={() => setShowPassword((v) => !v)}
        onToggleConfirm={() => setShowConfirm((v) => !v)}
      />

      <button
        type="submit"
        disabled={loading}
        className="hero-cta hero-cta--block mt-4"
      >
        {loading ? t('actions.loading') : t('auth.register')}
      </button>

      <p className="mt-5 text-center text-sm text-zinc-500">
        <a
          href={loginHref}
          className="rounded-md px-2 py-1 font-medium text-zinc-300 underline-offset-4 transition-colors hover:text-[var(--color-brand-orange-light)] hover:underline focus-visible:text-[var(--color-brand-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-orange)]/45"
        >
          {t('auth.alreadyHaveAccount')}
        </a>
      </p>
    </form>
  );
}
