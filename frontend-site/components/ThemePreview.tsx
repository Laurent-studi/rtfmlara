'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ShineBorder } from '@/components/magicui/shine-border';

interface Theme {
  id: string;
  name: string;
  description: string;
  previewUrl: string;
  isPremium: boolean;
  colors?: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
}

interface ThemePreviewProps {
  theme: Theme;
  isSelected: boolean;
  onSelect: (themeId: string) => void;
}

const ThemePreview: React.FC<ThemePreviewProps> = ({
  theme,
  isSelected,
  onSelect
}) => {
  const [showPreview, setShowPreview] = useState(false);
  
  return (
    <div>
      <motion.div
        onClick={() => onSelect(theme.id)}
        whileHover={{ scale: 1.02 }}
        className={`bg-white/10 hover:bg-white/15 rounded-xl p-4 cursor-pointer transition-all ${
          isSelected ? 'border-2 border-indigo-500' : 'border-2 border-transparent'
        }`}
      >
        <div className="relative">
          <div className="relative w-full h-32 rounded-lg overflow-hidden mb-3">
            <Image
              src={theme.previewUrl}
              alt={theme.name}
              fill
              className="object-cover"
            />
            {theme.isPremium && (
              <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs py-1 px-2 rounded-full">
                Premium
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPreview(true);
              }}
              className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white text-xs py-1 px-2 rounded-lg transition-all"
            >
              Aperçu
            </button>
          </div>
          <h4 className="text-white font-medium">{theme.name}</h4>
          <p className="text-gray-400 text-sm mt-1">{theme.description}</p>
        </div>
        
        {isSelected && (
          <div className="mt-3 flex justify-between items-center">
            <span className="text-indigo-400 text-sm">Actif</span>
            <span className="bg-indigo-500 rounded-full w-4 h-4 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
        )}
      </motion.div>
      
      {showPreview && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0D111E] rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] relative"
          >
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            <div className="overflow-y-auto max-h-[90vh]">
              <div className="relative w-full h-60">
                <Image
                  src={theme.previewUrl}
                  alt={theme.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D111E] to-transparent"></div>
                
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-white text-2xl font-bold mb-1">{theme.name}</h2>
                  <p className="text-gray-300">{theme.description}</p>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-white font-medium mb-4">Aperçu du thème</h3>
                
                <div className="space-y-6">
                  {/* Navbar preview */}
                  <div style={{ backgroundColor: theme.colors?.background || '#0D111E' }} className="rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-indigo-500 w-8 h-8 rounded-lg"></div>
                        <div style={{ color: theme.colors?.text || 'white' }} className="font-semibold">RTFM2Win</div>
                      </div>
                      <div className="flex gap-4">
                        <div style={{ backgroundColor: theme.colors?.primary || '#4f46e5' }} className="w-16 h-8 rounded-lg"></div>
                        <div style={{ backgroundColor: theme.colors?.secondary || '#7c3aed' }} className="w-8 h-8 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Card preview */}
                  <div style={{ backgroundColor: theme.colors?.background || '#0D111E', borderColor: theme.colors?.accent || 'rgba(255,255,255,0.1)' }} className="rounded-xl p-4 border">
                    <div style={{ color: theme.colors?.text || 'white' }} className="font-semibold mb-2">Quiz Populaire</div>
                    <div style={{ color: theme.colors?.text || 'rgba(255,255,255,0.7)' }} className="text-sm mb-3">
                      Un quiz sur les connaissances générales avec plusieurs questions variées.
                    </div>
                    <div style={{ backgroundColor: theme.colors?.primary || '#4f46e5' }} className="rounded-lg text-white text-center py-2">
                      Commencer
                    </div>
                  </div>
                  
                  {/* Button variants */}
                  <div className="flex flex-wrap gap-3">
                    <div style={{ backgroundColor: theme.colors?.primary || '#4f46e5' }} className="rounded-lg text-white px-4 py-2">
                      Bouton primaire
                    </div>
                    <div style={{ backgroundColor: theme.colors?.secondary || '#7c3aed' }} className="rounded-lg text-white px-4 py-2">
                      Bouton secondaire
                    </div>
                    <div style={{ backgroundColor: 'transparent', borderColor: theme.colors?.accent || 'rgba(255,255,255,0.2)', color: theme.colors?.text || 'white' }} className="rounded-lg border px-4 py-2">
                      Bouton tertiaire
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between">
                  {theme.isPremium && (
                    <button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white py-2 px-4 rounded-lg">
                      Débloquer (Premium)
                    </button>
                  )}
                  
                  <ShineBorder>
                    <button
                      onClick={() => {
                        onSelect(theme.id);
                        setShowPreview(false);
                      }}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2 px-6 rounded-lg"
                    >
                      {isSelected ? 'Actuellement sélectionné' : 'Sélectionner ce thème'}
                    </button>
                  </ShineBorder>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ThemePreview; 