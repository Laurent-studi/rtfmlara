'use client';

import { useTheme } from '../app/providers/ThemeProvider';

export default function ThemeTest() {
  const { currentTheme, themes, setTheme } = useTheme();

  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'var(--background)',
      color: 'var(--foreground)',
      border: '2px solid var(--border)',
      borderRadius: '8px',
      margin: '20px'
    }}>
      <h2 style={{ color: 'var(--primary)' }}>
        Test des Variables CSS - Thème: {currentTheme?.name || 'Aucun'}
      </h2>
      
      <div style={{
        backgroundColor: 'var(--card)',
        color: 'var(--card-foreground)',
        padding: '15px',
        borderRadius: '6px',
        margin: '10px 0'
      }}>
        <p>Ceci est un test avec les variables CSS des thèmes.</p>
        <button 
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
          onClick={() => setTheme(1)}
        >
          Light
        </button>
        <button 
          style={{
            backgroundColor: 'var(--secondary)',
            color: 'var(--secondary-foreground)',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
          onClick={() => setTheme(2)}
        >
          Dark
        </button>
        <button 
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-foreground)',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={() => setTheme(3)}
        >
          Neon
        </button>
      </div>
      
      <div style={{ marginTop: '15px' }}>
        <h3 style={{ color: 'var(--secondary)' }}>Variables CSS actuelles :</h3>
        <ul style={{ color: 'var(--muted-foreground)' }}>
          <li>--primary: <span style={{ color: 'var(--primary)' }}>■</span></li>
          <li>--secondary: <span style={{ color: 'var(--secondary)' }}>■</span></li>
          <li>--accent: <span style={{ color: 'var(--accent)' }}>■</span></li>
          <li>--background: <span style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', padding: '2px 8px' }}>Background</span></li>
        </ul>
      </div>
    </div>
  );
} 