import React from "react";
import { useRouter } from "next/navigation";
import "./ErrorMessage.scss";

type ErrorMessageProps = {
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
};

export default function ErrorMessage({
  message = "Something went wrong. Please try again.",
  showRetry = true,
  onRetry,
}: ErrorMessageProps) {
  const router = useRouter();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      router.refresh();
    }
  };

  return (
    <div className="error-message">
      <p className="error-message__text">{message}</p>
      {showRetry && (
        <button onClick={handleRetry} className="error-message__button">
          Retry
        </button>
      )}
    </div>
  );
}
