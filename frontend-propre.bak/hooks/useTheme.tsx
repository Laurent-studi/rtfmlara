"use client";

import React, { useState, useEffect, createContext, useContext } from 'react';

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

const defaultTheme = "theme-default";

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  setTheme: () => {}
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<string>(defaultTheme);

  useEffect(() => {
    // Essayer de charger le thème depuis le localStorage
    try {
      const savedTheme = localStorage.getItem('theme') || defaultTheme;
      setTheme(savedTheme);
    } catch (error) {
      // Gérer le cas où localStorage n'est pas disponible (SSR)
      console.warn('LocalStorage non disponible:', error);
    }
  }, []);

  const updateTheme = (newTheme: string) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('theme', newTheme);
    } catch (error) {
      console.warn('LocalStorage non disponible:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 