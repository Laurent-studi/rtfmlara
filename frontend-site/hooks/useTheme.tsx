// hooks/useTheme.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'theme-dark' | 'theme-light' | 'theme-neon' | string;

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('theme-dark');

  useEffect(() => {
    // Charger le thème depuis localStorage
    try {
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme) {
        setTheme(savedTheme);
        document.body.className = savedTheme;
      }
    } catch (error) {
      console.warn('Erreur lors de l\'accès à localStorage:', error);
    }
  }, []);

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    
    try {
      // Sauvegarder dans localStorage
      localStorage.setItem('theme', newTheme);
      
      // Appliquer au body pour le CSS
      document.body.className = newTheme;
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde du thème:', error);
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
    throw new Error('useTheme doit être utilisé à l\'intérieur d\'un ThemeProvider');
  }
  return context;
}