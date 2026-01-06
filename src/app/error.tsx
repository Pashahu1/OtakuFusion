'use client';
import { type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
type ErrorMessageProps = {
  title?: string;
  message?: string;
  icon?: ReactNode;
  showRetry?: boolean;
  onRetry?: () => void;
  fullPage?: boolean;
};

export default function Error({
  title = 'Error',
  message = 'Failed to load data.',
  icon,
  showRetry = true,
  onRetry,
  fullPage = false,
}: ErrorMessageProps) {
  const router = useRouter();

  const handleRetry = () => {
    if (onRetry) onRetry();
    else router.refresh();
  };

  return (
    <div
      className={`flex flex-col items-center justify-center text-center h-[60vh] ${fullPage ? 'h-screen' : 'py-10'} animate-fadeIn `}
    >
      {icon && (
        <div className="mb-4 text-6xl opacity-80 drop-shadow-[0_0_15px_rgba(255,0,0,0.4)]">
          {icon}
        </div>
      )}
      <h2 className="text-3xl font-extrabold mb-2 text-red-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.4)]">
        {title}
      </h2>
      <p className="text-gray-300 max-w-[340px] leading-relaxed"> {message} </p>
      {showRetry && (
        <button
          onClick={handleRetry}
          className="w-[120px] h-[40px] rounded-xl font-semibold bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          Repeat
        </button>
      )}
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
