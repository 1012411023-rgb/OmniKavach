import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext({ theme: 'dark', isDark: true, toggleTheme: () => {} });

function getPreferredTheme() {
  try {
    const storedTheme = localStorage.getItem('omnkavach-theme');
    if (storedTheme === 'dark' || storedTheme === 'light') {
      return storedTheme;
    }
  } catch {
    /* localStorage unavailable */
  }

  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getPreferredTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;

    try {
      localStorage.setItem('omnkavach-theme', theme);
    } catch {
      /* localStorage unavailable */
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;

    let storedTheme = null;
    try {
      storedTheme = localStorage.getItem('omnkavach-theme');
    } catch {
      return undefined;
    }

    if (storedTheme === 'dark' || storedTheme === 'light') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event) => {
      setTheme(event.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  const value = useMemo(() => ({ theme, isDark: theme === 'dark', toggleTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
