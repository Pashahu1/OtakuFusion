'use client';
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type EmptyStateProps = {
  title?: string;
  message?: string;
  icon?: ReactNode;
  fullPage?: boolean;
  plain?: boolean;
};

export function EmptyState({
  title = 'Empty',
  message = 'Here is no data to display.',
  icon,
  fullPage = false,
  plain = false,
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        'w-full space-y-6 px-4 py-8 md:px-6 lg:px-10',
        !plain && 'bg-[#111]'
      )}
    >
      <div
        className={`flex flex-col items-center justify-center text-center ${fullPage ? 'h-screen' : 'py-10'}`}
      >
        {icon && <div className="mb-4 text-5xl opacity-80">{icon}</div>}
        <h2 className="mb-2 text-xl font-bold text-white sm:text-2xl">
          {title}
        </h2>
        <p className="max-w-[min(100%,320px)] px-2 text-sm text-gray-400 sm:text-base">
          {message}
        </p>
      </div>
    </section>
  );
}
