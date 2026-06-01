'use client';

import { VerifyEmailForm } from '@/features/auth/ui/VerifyEmailForm';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import './verify-email-modal.scss';

interface VerifyEmailModalProps {
  email: string;
  onClose: () => void;
  onVerified: () => void;
}

export function VerifyEmailModal({
  email,
  onClose,
  onVerified,
}: VerifyEmailModalProps) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="verify-email-modal"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="verify-email-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="verify-email-modal-title"
      >
        <button
          type="button"
          className="verify-email-modal__close"
          onClick={onClose}
          aria-label="Close verification dialog"
        >
          <X size={18} strokeWidth={2.25} aria-hidden />
        </button>

        <VerifyEmailForm
          initialEmail={email}
          lockEmail
          onVerified={onVerified}
          className="border-0 bg-transparent p-0 shadow-none backdrop-blur-none sm:p-0"
        />
      </div>
    </div>
  );
}
