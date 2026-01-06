'use client';

import { type ReactNode } from 'react';

type ErrorStateProps = {
  title?: string;
  message?: string;
  icon?: ReactNode;
  showRetry?: boolean;
  onRetry?: () => void;
  fullPage?: boolean;
};

export default function ErrorState({
  title = 'Error',
  message = 'failed to load data.',
  icon,
  showRetry = true,
  onRetry,
  fullPage = false,
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center gap-[10px] ${
        fullPage ? 'h-screen' : 'py-10'
      }`}
    >
      {icon && <div className="mb-4 text-5xl opacity-80">{icon}</div>}

      <h2 className="text-2xl font-bold mb-2 text-red-500">{title}</h2>

      <p className="text-gray-400 max-w-[320px]">{message}</p>

      {showRetry && (
        <button
          onClick={onRetry}
          className="w-[250px] h-[40px] mt-6 px-6 py-2 bg-red-600 rounded-xl hover:bg-red-700 transition"
        >
          Repeat
        </button>
      )}
    </div>
  );
}
