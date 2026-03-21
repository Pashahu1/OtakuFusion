'use client';

import { type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
type ErrorStateProps = {
  title?: string;
  message?: string;
  icon?: ReactNode;
  showRetry?: boolean;
  onRetry?: () => void;
  fullPage?: boolean;
};

export function ErrorState({
  title = 'Error',
  message = 'failed to load data.',
  icon,
  showRetry = true,
  onRetry,
  fullPage = false,
}: ErrorStateProps) {
  const router = useRouter();

  const handleRetry = () => {
    if (onRetry) onRetry();
    else router.refresh();
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-[10px] text-center ${
        fullPage ? 'h-screen' : 'py-10'
      }`}
    >
      {icon && <div className="mb-4 text-5xl opacity-80">{icon}</div>}

      <h2 className="mb-2 text-xl font-bold text-red-500 sm:text-2xl">
        {title}
      </h2>

      <p className="max-w-[min(100%,320px)] px-2 text-sm text-gray-400 sm:text-base">
        {message}
      </p>

      {showRetry && (
        <button
          type="button"
          onClick={handleRetry}
          className="mt-6 h-11 w-full max-w-[250px] rounded-xl bg-red-600 px-6 py-2 text-sm transition hover:bg-red-700 sm:h-10 sm:text-base"
        >
          Repeat
        </button>
      )}
    </div>
  );
}
