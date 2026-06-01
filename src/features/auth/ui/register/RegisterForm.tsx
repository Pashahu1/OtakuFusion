'use client';

import { cn } from '@/lib/utils';

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
    handleRegister,
  } = useRegisterForm();

  return (
    <form
      onSubmit={handleRegister}
      className="flex flex-col gap-1 p-4 sm:gap-2 sm:p-8"
      noValidate
    >
      <h2 className="mb-5 text-center font-serif text-xl font-normal tracking-tight text-white sm:text-2xl">
        Create Account
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
        className={cn(
          'mt-4 h-11 w-full touch-manipulation rounded-lg border border-transparent px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-orange-light)] focus-visible:ring-offset-2 focus-visible:ring-offset-black',
          loading
            ? 'cursor-wait bg-[var(--color-brand-orange)] text-[var(--color-brand-text-primary)] opacity-90 shadow-md shadow-[var(--color-brand-orange-light)]/35'
            : 'bg-[var(--color-brand-orange)] text-[var(--color-brand-text-primary)] shadow-md shadow-[var(--color-brand-orange-light)]/35 hover:bg-[var(--color-brand-orange-light)] active:scale-[0.99]',
        )}
      >
        {loading ? 'Loading...' : 'Register'}
      </button>

      <p className="mt-5 text-center text-sm text-zinc-500">
        <a
          href="/auth/login"
          className="rounded-md px-2 py-1 font-medium text-zinc-300 underline-offset-4 transition-colors hover:text-[var(--color-brand-orange-light)] hover:underline focus-visible:text-[var(--color-brand-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-orange)]/45"
        >
          Already have an account?
        </a>
      </p>
    </form>
  );
}
