'use client';

import { useTheme } from '@/hooks/useTheme';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';

type ThemeOption = {
  id: number;
  name: string;
  code: string;
  description: string;
  is_premium: boolean;
};

// Thèmes par défaut au cas où l'API n'est pas disponible
const defaultThemes: ThemeOption[] = [
  {
    id: 1,
    name: 'Dark',
    code: 'theme-dark',
    description: 'Thème sombre avec des tons indigo et violet',
    is_premium: false
  },
  {
    id: 2,
    name: 'Light',
    code: 'theme-light',
    description: 'Thème clair avec des couleurs bleu',
    is_premium: false
  },
  {
    id: 3,
    name: 'Neon',
    code: 'theme-neon',
    description: 'Thème vibrant avec des couleurs néon',
    is_premium: true
  }
];

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [themes, setThemes] = useState<ThemeOption[]>(defaultThemes);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const data = await api.getThemes();
        if (data && Array.isArray(data) && data.length > 0) {
          setThemes(data);
        } else if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
          // Au cas où l'API renvoie les données dans un objet avec une propriété 'data'
          setThemes(data.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des thèmes:', error);
        // En cas d'erreur, on garde les thèmes par défaut
      } finally {
        setLoading(false);
      }
    };

    fetchThemes();
  }, []);

  const handleThemeChange = (themeCode: string) => {
    setTheme(themeCode);
    
    // Si l'utilisateur est connecté, sauvegarder la préférence
    try {
      const selectedTheme = themes.find(t => t.code === themeCode);
      if (selectedTheme) {
        api.saveUserTheme(selectedTheme.id.toString())
          .catch(error => console.error('Erreur lors de la sauvegarde du thème:', error));
      }
    } catch (error) {
      console.error('Erreur lors du changement de thème:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-white/10 backdrop-blur-xl rounded-lg text-white">
        Chargement des thèmes...
      </div>
    );
  }

  return (
    <div className="p-4 bg-white/10 backdrop-blur-xl rounded-lg text-white">
      <h3 className="text-lg font-medium mb-4">Choisir un thème</h3>
      <div className="grid gap-3">
        {themes.map((themeOption) => (
          <motion.div
            key={themeOption.code}
            className={`p-3 rounded-lg cursor-pointer transition-all ${
              theme === themeOption.code 
                ? 'bg-white/20 border border-white/30' 
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
            onClick={() => handleThemeChange(themeOption.code)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{themeOption.name}</h4>
              {themeOption.is_premium && (
                <span className="text-xs px-2 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-full">
                  Premium
                </span>
              )}
            </div>
            <p className="text-sm opacity-75 mt-1">{themeOption.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
