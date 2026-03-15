import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';

type UseLocalStorageReturn<T> = [T, Dispatch<SetStateAction<T>>, () => void];

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): UseLocalStorageReturn<T> {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const item = localStorage.getItem(key);
      if (!item) return initialValue;

      const parsed = JSON.parse(item);

      if (Array.isArray(initialValue) && !Array.isArray(parsed)) {
        return initialValue;
      }

      if (
        typeof initialValue === 'object' &&
        !Array.isArray(initialValue) &&
        (typeof parsed !== 'object' || Array.isArray(parsed))
      ) {
        return initialValue;
      }

      return parsed;
    } catch {
      return initialValue;
    }
  });

  const clear = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
    setValue(initialValue);
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !key) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[useLocalStorage]', key, err);
      }
    }
  }, [key, value]);

  return [value, setValue, clear];
}
