import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
type ButtonVariant = 'primary' | 'secondary' | 'outline';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
}
const baseStyles =
  'flex items-center justify-center w-full h-10 rounded-md text-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  
const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-orange text-brand-gray-light lg:hover:bg-brand-orange-light lg:hover:text-brand-gray',
  secondary:
    'bg-brand-gray-light text-brand-text-primary lg:hover:bg-brand-gray-softer',
  outline:
    'border border-brand-orange text-brand-orange lg:hover:bg-brand-orange lg:hover:text-brand-gray-light',
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
