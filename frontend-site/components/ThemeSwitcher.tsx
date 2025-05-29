'use client';

import { useTheme } from '@/app/providers/ThemeProvider';

export default function ThemeSwitcher() {
  const { currentTheme, themes, setTheme } = useTheme();

  if (!themes || themes.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">Thème:</span>
      <select 
        value={currentTheme?.id || ''}
        onChange={(e) => setTheme(Number(e.target.value))}
        className="rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm transition-colors text-foreground focus:ring-1 focus:ring-primary"
      >
        {themes.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.name}
          </option>
        ))}
      </select>
    </div>
  );
} 