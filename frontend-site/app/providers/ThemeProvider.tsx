'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

// Définition de l'interface Theme
interface Theme {
  id: number;
  name: string;
  code: string;
  filename: string;
  description: string | null;
  is_default: boolean;
  is_active: boolean;
  is_premium?: boolean;
}

// Définition du contexte de thème
interface ThemeContextType {
  currentTheme: Theme | null;
  themes: Theme[];
  isLoading: boolean;
  setTheme: (themeId: number) => Promise<void>;
}

// Thèmes par défaut à utiliser si l'API est inaccessible
const defaultThemes: Theme[] = [
  {
    id: 1,
    name: 'Light',
    code: 'light',
    filename: 'light.css',
    description: 'Thème clair par défaut',
    is_default: true,
    is_active: true
  },
  {
    id: 2,
    name: 'Dark',
    code: 'dark',
    filename: 'dark.css',
    description: 'Thème sombre',
    is_default: false,
    is_active: true
  },
  {
    id: 3,
    name: 'Neon',
    code: 'neon',
    filename: 'neon.css',
    description: 'Thème néon vibrant',
    is_default: false,
    is_active: true
  },
  {
    id: 4,
    name: 'Elegant',
    code: 'elegant',
    filename: 'elegant.css',
    description: 'Thème élégant et minimaliste',
    is_default: false,
    is_active: true
  },
  {
    id: 5,
    name: 'Pastel',
    code: 'pastel',
    filename: 'pastel.css',
    description: 'Thème aux couleurs pastel',
    is_default: false,
    is_active: true
  },
  {
    id: 6,
    name: 'Fun',
    code: 'fun',
    filename: 'fun.css',
    description: 'Thème amusant et coloré',
    is_default: false,
    is_active: true
  }
];

// Création du contexte avec des valeurs par défaut
const ThemeContext = createContext<ThemeContextType>({
  currentTheme: null,
  themes: [],
  isLoading: true,
  setTheme: async () => {},
});

// Hook pour accéder au contexte de thème
export const useTheme = () => useContext(ThemeContext);

// Props du ThemeProvider
interface ThemeProviderProps {
  children: ReactNode;
}

// Composant ThemeProvider
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [themes, setThemes] = useState<Theme[]>(defaultThemes);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  // Fonction pour appliquer le thème à l'élément HTML
  const applyTheme = (theme: Theme) => {
    // 1. Définir l'attribut data-theme pour Tailwind 4
    document.documentElement.setAttribute('data-theme', theme.code);
    
    // Définir également l'attribut theme-name pour la rétrocompatibilité
    document.documentElement.setAttribute('theme-name', theme.code);
    
    // Ajouter la classe du thème pour s'assurer que les styles sont appliqués
    document.documentElement.classList.remove('light', 'dark', 'neon', 'elegant', 'pastel', 'fun');
    document.documentElement.classList.add(theme.code);
    
    // 2. Charger la feuille de style CSS du thème
    const existingLink = document.getElementById('theme-stylesheet');
    
    if (existingLink) {
      // Mettre à jour le lien existant
      existingLink.setAttribute('href', `/css/themes/${theme.filename}`);
    } else {
      // Créer un nouveau lien
      const link = document.createElement('link');
      link.id = 'theme-stylesheet';
      link.rel = 'stylesheet';
      link.href = `/css/themes/${theme.filename}`;
      document.head.appendChild(link);
    }

    // 3. Définir également le localStorage pour la persistance
    localStorage.setItem('theme', theme.code);
    
    console.log(`Thème appliqué: ${theme.name} (${theme.code})`);
  };

  // Fonction pour changer de thème
  const setTheme = async (themeId: number) => {
    setIsLoading(true);
    try {
      // Trouver le thème dans la liste des thèmes
      const theme = themes.find(t => t.id === themeId);
      
      if (!theme) {
        console.warn(`Thème avec l'ID ${themeId} non trouvé, utilisation du thème par défaut`);
        // Utiliser le thème par défaut si le thème demandé n'existe pas
        const defaultTheme = themes.find(t => t.is_default) || themes[0];
        if (defaultTheme) {
          applyTheme(defaultTheme);
          setCurrentTheme(defaultTheme);
        }
        return;
      }
      
      // Appliquer le thème localement
      applyTheme(theme);
      setCurrentTheme(theme);
      
      // Ne pas essayer de sauvegarder sur le serveur si en mode local/développement
      const isLocalMode = process.env.NODE_ENV === 'development';
      
      // Enregistrer la préférence sur le serveur uniquement si connecté et pas en mode local
      if (!isLocalMode) {
        try {
          await api.saveUserTheme(themeId);
        } catch (error) {
          console.warn('Impossible de sauvegarder la préférence de thème sur le serveur:', error);
        }
      }
    } catch (error) {
      console.error('Erreur lors du changement de thème:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les thèmes depuis l'API
  useEffect(() => {
    const fetchThemes = async () => {
      setIsLoading(true);
      try {
        // Essayer d'abord l'API normale
        const response = await api.getThemes();
        if (response && response.data && response.data.length > 0) {
          setThemes(response.data);
          return;
        }
        
        // Si la réponse est vide, essayer l'appel direct
        const directResponse = await fetch('http://localhost:8000/api/themes');
        if (directResponse.ok) {
          const data = await directResponse.json();
          if (data && data.data && data.data.length > 0) {
            setThemes(data.data);
            return;
          }
        }
        
        // Si toutes les tentatives échouent ou donnent des listes vides, utiliser les thèmes par défaut
        console.warn('Aucun thème trouvé via API, utilisation des thèmes par défaut');
        setIsOffline(true);
        // Assurer que defaultThemes est toujours utilisé en cas d'échec
        setThemes(defaultThemes);
      } catch (error) {
        console.warn('Impossible de charger les thèmes depuis l\'API, utilisation des thèmes par défaut:', error);
        setIsOffline(true);
        // Assurer que defaultThemes est toujours utilisé en cas d'échec
        setThemes(defaultThemes);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThemes();
  }, []);

  // Appliquer le thème par défaut au chargement
  useEffect(() => {
    // Fonction pour appliquer le thème par défaut
    const applyInitialTheme = () => {
      if (themes.length === 0) {
        console.warn("Aucun thème disponible, impossible d'appliquer un thème initial");
        return;
      }

      // 1. Vérifier si un thème est déjà stocké dans localStorage
      const savedThemeCode = localStorage.getItem('theme');
      if (savedThemeCode) {
        const savedTheme = themes.find(t => t.code === savedThemeCode);
        if (savedTheme) {
          applyTheme(savedTheme);
          setCurrentTheme(savedTheme);
          return;
        }
      }
      
      // 2. Sinon, utiliser le thème par défaut
      const defaultTheme = themes.find(t => t.is_default) || themes[0];
      if (defaultTheme) {
        applyTheme(defaultTheme);
        setCurrentTheme(defaultTheme);
      } else {
        console.warn("Aucun thème par défaut trouvé, utilisation du premier thème disponible");
        applyTheme(themes[0]);
        setCurrentTheme(themes[0]);
      }
    };

    // Appliquer le thème initial seulement après avoir chargé les thèmes
    if (!isLoading) {
      applyInitialTheme();
    }
  }, [isLoading, themes]);

  return (
    <ThemeContext.Provider value={{ currentTheme, themes, isLoading, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
} 
