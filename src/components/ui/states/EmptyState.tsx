'use client';
import { type ReactNode } from 'react';
type EmptyStateProps = {
  title?: string;
  message?: string;
  icon?: ReactNode;
  fullPage?: boolean;
};
export default function EmptyState({
  title = 'Empty',
  message = 'Here is no data to display.',
  icon,
  fullPage = false,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${fullPage ? 'h-screen' : 'py-10'}`}
    >
      {icon && <div className="mb-4 text-5xl opacity-80">{icon}</div>}
      <h2 className="text-2xl font-bold mb-2 text-white">{title}</h2>
      <p className="text-gray-400 max-w-[320px]">{message}</p>
    </div>
  );
}
