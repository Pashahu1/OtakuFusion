import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
type ButtonVariant = 'primary' | 'secondary' | 'outline';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
}
const baseStyles =
  'hero-cta hero-cta--block disabled:opacity-50 disabled:cursor-not-allowed';

const variantStyles: Record<ButtonVariant, string> = {
  primary: '',
  secondary: 'hero-cta--secondary',
  outline: 'hero-cta--secondary',
};

export const Button = ({
  children,
  variant = 'primary',
  className,
  ...props
}: ButtonProps) => {
  return (
    <button
      {...props}
      className={clsx(baseStyles, variantStyles[variant], className)}
    >
      {children}
    </button>
  );
};
