'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { APP_CONFIG } from '@/lib/config';
import { MockDataService } from '@/lib/mockData';

// Classe POO pour la gestion des thèmes
class ThemeManager {
  static THEME_KEY = 'theme_code';

  /**
   * Applique le thème en mettant à jour l'attribut data-theme sur <html>
   */
  static applyTheme(themeCode: string) {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', themeCode);
    }
  }

  /**
   * Sauvegarde le code du thème dans le localStorage
   */
  static saveTheme(themeCode: string) {
    localStorage.setItem(ThemeManager.THEME_KEY, themeCode);
  }

  /**
   * Récupère le code du thème sauvegardé
   */
  static getSavedTheme(): string | null {
    return localStorage.getItem(ThemeManager.THEME_KEY);
  }
}

interface Theme {
  id: number;
  name: string;
  code: string;
  description?: string;
  filename?: string;
  is_default?: boolean;
}

export default function ThemeSwitcher() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selected, setSelected] = useState<string>('light');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer la liste des thèmes actifs depuis l'API ou les données mockées
  useEffect(() => {
    const fetchThemes = async () => {
      setLoading(true);
      setError(null);
      try {
        let res;
        
        // Utiliser les données mockées en mode développement
        if (APP_CONFIG.DEV_MODE && APP_CONFIG.DISABLE_API_CALLS) {
          res = await MockDataService.getThemes();
        } else {
          res = await api.get('themes');
        }
        
        if (res.status === 'success' && Array.isArray(res.data)) {
          setThemes(res.data);
          // Déterminer le thème à appliquer au chargement
          let themeCode = ThemeManager.getSavedTheme();
          if (!themeCode) {
            // Si pas de thème sauvegardé, prendre le thème par défaut de l'API
            const defaultTheme = res.data.find((t: Theme) => t.is_default);
            themeCode = defaultTheme ? defaultTheme.code : res.data[0]?.code || 'light';
          }
          // Forcer themeCode à être une string
          setSelected(themeCode || 'light');
          ThemeManager.applyTheme(themeCode || 'light');
        } else {
          setError('Erreur lors du chargement des thèmes');
        }
      } catch (e: any) {
        console.warn('Erreur lors du chargement des thèmes, utilisation des données par défaut:', e);
        // Fallback avec les données mockées
        const mockRes = await MockDataService.getThemes();
        setThemes(mockRes.data);
        setSelected('light');
        ThemeManager.applyTheme('light');
      } finally {
        setLoading(false);
      }
    };
    fetchThemes();
  }, []);

  // Appliquer le thème quand sélection change
  useEffect(() => {
    if (!selected) return;
    ThemeManager.applyTheme(selected);
    ThemeManager.saveTheme(selected);
    // Enregistrer le choix côté API utilisateur (seulement si authentifié)
    const saveUserTheme = async () => {
      try {
        const authToken = localStorage.getItem('auth_token');
        if (!authToken) return; // Pas d'appel API si non connecté
        
        // On cherche l'id du thème sélectionné
        const theme = themes.find(t => t.code === selected);
        if (theme) {
          if (APP_CONFIG.DEV_MODE && APP_CONFIG.DISABLE_API_CALLS) {
            await MockDataService.applyTheme(theme.id);
          } else {
            await api.post('themes/apply', { theme_id: theme.id });
          }
        }
      } catch (e) {
        // Silencieux, pas bloquant
        console.warn('Impossible de sauvegarder le thème sur le serveur:', e);
      }
    };
    if (themes.length > 0) saveUserTheme();
  }, [selected, themes]);

  if (loading) {
    return <div style={{ color: 'var(--muted-color)', fontSize: '0.95rem' }}>Chargement des thèmes...</div>;
  }
  if (error) {
    return <div style={{ color: 'red', fontSize: '0.95rem' }}>{error}</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label htmlFor="theme-select" style={{ fontSize: '0.95rem', color: 'var(--muted-color)', marginBottom: 4 }}>Thème</label>
      <select
        id="theme-select"
        className="theme-select"
        value={selected}
        onChange={e => setSelected(e.target.value)}
        style={{ minWidth: 120, borderRadius: 6, padding: '6px 12px', fontSize: '1rem' }}
      >
        {themes.map(theme => (
          <option key={theme.code} value={theme.code}>{theme.name}</option>
        ))}
      </select>
      <span style={{ fontSize: '0.85rem', color: 'var(--muted-color)', marginTop: 2 }}>
        {themes.find(t => t.code === selected)?.description}
      </span>
    </div>
  );
} 