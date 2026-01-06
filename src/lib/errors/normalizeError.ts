import { ApiError } from './ApiError';

export function normalizeError(error: unknown) {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      status: error.status,
      isNetworkError: false,
    };
  }
  if (error instanceof TypeError) {
    return {
      message: 'Network error. Please check your connection.',
      isNetworkError: true,
    };
  }
  return {
    message: 'An unknown error occurred.',
    isNetworkError: false,
  };
}
