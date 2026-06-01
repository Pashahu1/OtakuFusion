export interface PasswordRule {
  id: string;
  label: string;
  met: boolean;
}

export function buildPasswordRules(password: string): PasswordRule[] {
  return [
    {
      id: 'length',
      label: 'At least 6 characters',
      met: password.length >= 6,
    },
    {
      id: 'mix',
      label: 'Letters and numbers',
      met: /[A-Za-z]/.test(password) && /[0-9]/.test(password),
    },
  ];
}
