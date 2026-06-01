'use client';

import { useMemo, useState } from 'react';

import { toast } from '@/lib/toast';

import { buildPasswordRules } from './profilePasswordRules';

export function useProfilePasswordChange(userEmail: string | undefined) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const passwordRules = useMemo(() => buildPasswordRules(newPassword), [newPassword]);

  const hasPasswordChanges =
    oldPassword.length > 0 || newPassword.length > 0 || confirmPassword.length > 0;

  const allRulesMet = passwordRules.every((rule) => rule.met);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const canSavePassword =
    hasPasswordChanges &&
    oldPassword.length > 0 &&
    allRulesMet &&
    passwordsMatch &&
    newPassword !== oldPassword;

  async function handlePasswordSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSavePassword) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        toast.error(data.message || 'Could not update password.');
        return;
      }

      toast.success('Password updated successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Something went wrong. Try again.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleDiscardPassword() {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowOld(false);
    setShowNew(false);
    setShowConfirm(false);
  }

  return {
    userEmail,
    oldPassword,
    setOldPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showOld,
    setShowOld,
    showNew,
    setShowNew,
    showConfirm,
    setShowConfirm,
    isSaving,
    passwordRules,
    hasPasswordChanges,
    passwordsMatch,
    canSavePassword,
    handlePasswordSubmit,
    handleDiscardPassword,
  };
}
