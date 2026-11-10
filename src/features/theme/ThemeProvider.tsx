'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  applyAppTheme,
  DEFAULT_THEME,
  parseAppTheme,
  THEME_STORAGE_KEY,
  type AppTheme,
} from './theme';

interface ThemeContextValue {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(): AppTheme {
  try {
    return parseAppTheme(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return DEFAULT_THEME;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>(DEFAULT_THEME);

  useEffect(() => {
    const stored = readStoredTheme();
    setThemeState(stored);
    applyAppTheme(stored);
    try {
      if (localStorage.getItem(THEME_STORAGE_KEY) !== stored) {
        localStorage.setItem(THEME_STORAGE_KEY, stored);
      }
    } catch {
      /* ignore quota / private mode */
    }
  }, []);

  const setTheme = useCallback((next: AppTheme) => {
    const resolved = parseAppTheme(next);
    setThemeState(resolved);
    applyAppTheme(resolved);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, resolved);
    } catch {
      /* ignore quota / private mode */
    }
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
