'use client';

import { useTheme } from '@/app/providers/ThemeProvider';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Définition de l'interface Theme
interface ThemeOption {
  id: number;
  name: string;
  code: string;
  filename: string;
  description: string | null;
  is_default: boolean;
  is_active: boolean;
  is_premium?: boolean;
}

export default function ThemeSelector() {
  const { currentTheme, themes, isLoading, setTheme } = useTheme();

  if (isLoading) {
    return (
      <div className="card-glass p-4 rounded-lg text-foreground">
        Chargement des thèmes...
      </div>
    );
  }

  return (
    <div className="card-glass p-4 rounded-lg">
      <h3 className="text-lg font-medium text-foreground mb-3">Thèmes</h3>
      
      <div className="grid grid-cols-2 gap-2">
        {themes.map((theme) => {
          const isActive = currentTheme?.id === theme.id;
          
          return (
            <motion.button
              key={theme.id}
              onClick={() => setTheme(theme.id)}
              className={`relative rounded-md p-3 transition-all duration-300 ${
                isActive 
                  ? 'ring-2 ring-primary shadow-lg' 
                  : 'hover:bg-background/20'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex flex-col items-center">
                {/* Indicateur de thème actif */}
                {isActive && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary"></div>
                )}
                
                {/* Aperçu du thème */}
                <div 
                  className="w-full h-16 rounded mb-2"
                  style={{ 
                    background: theme.code === 'light' 
                      ? 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' 
                      : theme.code === 'dark' 
                      ? 'linear-gradient(135deg, #212529 0%, #343a40 100%)' 
                      : theme.code === 'neon' 
                      ? 'linear-gradient(135deg, #09090b 0%, #18181b 100%), radial-gradient(circle at top right, #f0abfc80, transparent 50%), radial-gradient(circle at bottom left, #22d3ee80, transparent 50%)' 
                      : theme.code === 'elegant' 
                      ? 'linear-gradient(135deg, #f8f5f0 0%, #ffffff 100%), radial-gradient(circle at top right, #8b5cf680, transparent 50%)' 
                      : theme.code === 'pastel' 
                      ? 'linear-gradient(135deg, #fcfaff 0%, #ffffff 100%), radial-gradient(circle at top right, #c4b5fd50, transparent 50%), radial-gradient(circle at bottom left, #93c5fd50, transparent 50%)' 
                      : theme.code === 'fun' 
                      ? 'linear-gradient(135deg, #fefbff 0%, #ffffff 100%), radial-gradient(circle at top right, #ff66c450, transparent 50%), radial-gradient(circle at bottom left, #3bf0c550, transparent 50%)' 
                      : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
                  }}
                ></div>
                
                <span className={`text-sm font-medium ${
                  isActive ? 'text-primary' : 'text-foreground'
                }`}>
                  {theme.name}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
      
      {/* Note informative */}
      <p className="text-xs text-muted-foreground mt-4">
        Le thème est enregistré localement dans votre navigateur.
      </p>
    </div>
  );
}
