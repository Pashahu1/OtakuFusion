'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface UnderlineFieldProps {
  id: string;
  label: string;
  hasError: boolean;
  children: ReactNode;
}

export function UnderlineField({
  id,
  label,
  hasError,
  children,
}: UnderlineFieldProps) {
  return (
    <div
      className={cn(
        'group mb-4 border-b-2 border-zinc-600 pb-1 transition-colors duration-200',
        hasError
          ? 'border-red-500'
          : 'focus-within:border-[var(--color-brand-orange)]',
      )}
    >
      <label
        htmlFor={id}
        className={cn(
          'mb-0.5 block text-xs font-medium tracking-wide transition-colors',
          hasError
            ? 'text-red-500'
            : 'text-[var(--color-brand-orange)]',
        )}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
