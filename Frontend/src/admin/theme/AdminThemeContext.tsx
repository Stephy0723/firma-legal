import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

type AdminTheme = 'light' | 'dark';

type AdminThemeContextValue = {
  theme: AdminTheme;
  toggleTheme: () => void;
  setTheme: (theme: AdminTheme) => void;
};

const STORAGE_KEY = 'admin_theme';

const AdminThemeContext = createContext<AdminThemeContextValue | undefined>(undefined);

const applyThemeToDocument = (theme: AdminTheme) => {
  document.documentElement.setAttribute('data-admin-theme', theme);
};

const getInitialTheme = (): AdminTheme => {
  const savedTheme = localStorage.getItem(STORAGE_KEY);
  return savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'light';
};

export const AdminThemeProvider = ({ children }: PropsWithChildren) => {
  const [theme, setThemeState] = useState<AdminTheme>(() => getInitialTheme());

  useEffect(() => {
    applyThemeToDocument(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (nextTheme: AdminTheme) => {
    setThemeState(nextTheme);
  };

  const toggleTheme = () => {
    setThemeState((current) => (current === 'light' ? 'dark' : 'light'));
  };

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      setTheme,
    }),
    [theme],
  );

  return <AdminThemeContext.Provider value={value}>{children}</AdminThemeContext.Provider>;
};

export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext);

  if (!context) {
    throw new Error('useAdminTheme must be used within AdminThemeProvider');
  }

  return context;
};
