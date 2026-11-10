export interface PasswordRule {
  id: string;
  label: string;
  met: boolean;
}

import { tStatic } from '@/i18n/t';

export function buildPasswordRules(password: string): PasswordRule[] {
  return [
    {
      id: 'length',
      label: tStatic('settings.ruleLength'),
      met: password.length >= 6,
    },
    {
      id: 'mix',
      label: tStatic('settings.ruleMix'),
      met: /[A-Za-z]/.test(password) && /[0-9]/.test(password),
    },
  ];
}
