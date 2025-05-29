import React from 'react';
import { useTheme } from '../providers/ThemeProvider';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme, availableThemes } = useTheme();

  return (
    <div style={{ margin: '1rem 0' }}>
      <label htmlFor="theme-select">Thème&nbsp;: </label>
      <select
        id="theme-select"
        value={theme}
        onChange={e => setTheme(e.target.value)}
      >
        {availableThemes.map(t => (
          <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSwitcher;
