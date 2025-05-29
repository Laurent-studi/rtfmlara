'use client';

import { useEffect } from 'react';
import { useTheme } from '@/app/providers/ThemeProvider';

interface NeonThemeWrapperProps {
  children: React.ReactNode;
}

export default function NeonThemeWrapper({ children }: NeonThemeWrapperProps) {
  const { themes, setTheme } = useTheme();

  useEffect(() => {
    // Trouver le thème néon dans la liste des thèmes
    const neonTheme = themes.find(t => t.code === 'neon');
    if (neonTheme) {
      // Appliquer le thème néon
      setTheme(neonTheme.id);
    }
  }, [themes, setTheme]);

  return <>{children}</>;
} 