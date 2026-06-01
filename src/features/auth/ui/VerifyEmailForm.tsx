'use client';

import { cn } from '@/lib/utils';

import { VerifyEmailFormActions } from './verify-email/VerifyEmailFormActions';
import { VerifyEmailFormFields } from './verify-email/VerifyEmailFormFields';
import { VerifyEmailFormHeader } from './verify-email/VerifyEmailFormHeader';
import { VerifyEmailResendCooldown } from './verify-email/VerifyEmailResendCooldown';
import { useVerifyEmailForm } from './verify-email/useVerifyEmailForm';

interface VerifyEmailFormProps {
  initialEmail: string;
  lockEmail?: boolean;
  onVerified?: () => void;
  className?: string;
}

export function VerifyEmailForm({
  initialEmail,
  lockEmail = false,
  onVerified,
  className,
}: VerifyEmailFormProps) {
  const {
    email,
    code,
    time,
    isLoading,
    codeError,
    emailError,
    canResend,
    resendProgress,
    handleVerify,
    handleResend,
    handleEmailChange,
    handleCodeChange,
  } = useVerifyEmailForm({ initialEmail, onVerified });

  return (
    <form
      onSubmit={handleVerify}
      className={cn(
        'flex w-full flex-col rounded-[24px] border border-zinc-800/90 bg-[#141519]/95 p-6 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.55)] backdrop-blur-md sm:p-8',
        className,
      )}
      noValidate
    >
      <VerifyEmailFormHeader />

      <VerifyEmailFormFields
        email={email}
        code={code}
        lockEmail={lockEmail}
        emailError={emailError}
        codeError={codeError}
        onEmailChange={handleEmailChange}
        onCodeChange={handleCodeChange}
      />

      <VerifyEmailFormActions
        isLoading={isLoading}
        canResend={canResend}
        onResend={handleResend}
      />

      <VerifyEmailResendCooldown time={time} progress={resendProgress} />
    </form>
  );
}
