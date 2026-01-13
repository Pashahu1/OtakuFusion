import { useEffect, useState } from 'react';

type UseLocalStorageReturn<T> = [T, (value: T) => void, () => void];

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): UseLocalStorageReturn<T> {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let item = localStorage.getItem(key);

    if (item) {
      try {
        return JSON.parse(item);
      } catch {
        return initialValue;
      }
    }

    return initialValue;
  });

  const clear = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
    setValue(initialValue);
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.log(err);
    }
  }, [value]);

  return [value, setValue, clear];
}
