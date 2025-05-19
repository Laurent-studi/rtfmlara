'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '../magicui/button';
import { Label } from '../magicui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../magicui/select';

// Types des styles d'avatars disponibles
type AvatarStyle = 'adventurer' | 'avataaars' | 'bottts' | 'lorelei' | 'pixel-art' | 'open-peeps';

// Props du composant
interface AvatarSelectorProps {
  initialAvatar?: string | null;
  username: string;
  onAvatarChange: (avatarUrl: string) => void;
}

export default function AvatarSelector({ initialAvatar, username, onAvatarChange }: AvatarSelectorProps) {
  // État pour suivre le style d'avatar sélectionné
  const [selectedStyle, setSelectedStyle] = useState<AvatarStyle>('adventurer');
  
  // État pour suivre les options supplémentaires (varie selon le style)
  const [options, setOptions] = useState<Record<string, string>>({});
  
  // URL de l'avatar généré
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  
  // Pour éviter les mises à jour en boucle
  const [isInitialized, setIsInitialized] = useState(false);

  // Liste des styles disponibles avec leurs noms d'affichage
  const avatarStyles = [
    { id: 'adventurer', name: 'Aventurier' },
    { id: 'avataaars', name: 'Avataaars' },
    { id: 'bottts', name: 'Robots' },
    { id: 'lorelei', name: 'Lorelei' },
    { id: 'pixel-art', name: 'Pixel Art' },
    { id: 'open-peeps', name: 'Open Peeps' },
  ];

  // Options pour le style adventurer
  const adventurerOptions = {
    backgroundColor: [
      { id: 'transparent', name: 'Transparent' },
      { id: 'b6e3f4', name: 'Bleu clair' },
      { id: 'c0aede', name: 'Violet' },
      { id: 'd1d4f9', name: 'Lavande' },
      { id: 'ffd5dc', name: 'Rose' },
      { id: 'ffdfbf', name: 'Pêche' },
    ],
  };

  // Générer l'URL de l'avatar
  const generateAvatarUrl = () => {
    if (!username) return '';
    
    // Création de la chaîne d'options en format URL
    const optionsString = Object.entries(options)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    
    // Construction de l'URL complète
    return `https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${encodeURIComponent(username)}${optionsString ? `&${optionsString}` : ''}`;
  };

  // Effet pour initialiser avec l'avatar existant si fourni (exécuté une seule fois)
  useEffect(() => {
    if (initialAvatar && !isInitialized) {
      // Analyser l'URL pour extraire le style
      const styleMatch = initialAvatar.match(/dicebear\.com\/7\.x\/([^/]+)/);
      if (styleMatch && styleMatch[1]) {
        const extractedStyle = styleMatch[1];
        
        // Vérifier si le style extrait est valide
        if (avatarStyles.some(style => style.id === extractedStyle)) {
          setSelectedStyle(extractedStyle as AvatarStyle);
        }
      }
      // Utiliser directement l'avatar initial
      setAvatarUrl(initialAvatar);
      onAvatarChange(initialAvatar);
      setIsInitialized(true);
    } else if (!initialAvatar && !isInitialized) {
      // Générer un avatar par défaut si aucun n'est fourni
      const defaultUrl = generateAvatarUrl();
      if (defaultUrl) {
        setAvatarUrl(defaultUrl);
        onAvatarChange(defaultUrl);
      } else {
        const fallbackUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=default`;
        setAvatarUrl(fallbackUrl);
        onAvatarChange(fallbackUrl);
      }
      setIsInitialized(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAvatar, isInitialized]);

  // Mettre à jour l'avatar manuellement (pour le bouton Appliquer)
  const updateAvatar = () => {
    const url = generateAvatarUrl();
    if (url) {
      setAvatarUrl(url);
      onAvatarChange(url);
    }
  };

  // Gestionnaire pour changer le style d'avatar
  const handleStyleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStyle = e.target.value as AvatarStyle;
    console.log("Nouveau style sélectionné:", newStyle);
    setSelectedStyle(newStyle);
    // Réinitialiser les options car elles peuvent être différentes pour chaque style
    setOptions({});
  };

  // Gestionnaire pour changer une option spécifique
  const handleOptionChange = (optionName: string, value: string) => {
    setOptions(prev => ({
      ...prev,
      [optionName]: value
    }));
  };

  return (
    <div className="bg-[#0F1622] border border-white/10 rounded-xl p-6 space-y-6">
      <h3 className="text-xl font-bold text-white mb-4">Personnaliser votre avatar</h3>
      
      {/* Prévisualisation de l'avatar */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500 p-1 bg-white">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Avatar"
              width={128}
              height={128}
              className="w-full h-full object-cover"
              key={avatarUrl} // Forcer le rechargement de l'image quand l'URL change
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>
        <p className="mt-2 text-gray-400 text-sm">Prévisualisation de votre avatar</p>
        <div className="mt-2 text-gray-400 text-sm">
          Style actuel: <span className="text-white">{selectedStyle}</span>
        </div>
      </div>
      
      {/* Sélection du style d'avatar avec des radio boutons natifs */}
      <div className="space-y-4">
        <Label className="text-white block mb-2">Style d'avatar</Label>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {avatarStyles.map((style) => (
            <div key={style.id} className="flex items-center space-x-2">
              <input
                type="radio"
                id={`style-${style.id}`}
                name="avatarStyle"
                value={style.id}
                checked={selectedStyle === style.id}
                onChange={handleStyleChange}
                className="h-4 w-4 text-indigo-500 bg-white/5 border-white/20 focus:ring-indigo-500 focus:ring-offset-0"
              />
              <label 
                htmlFor={`style-${style.id}`}
                className="text-white cursor-pointer"
              >
                {style.name}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Options spécifiques pour le style Adventurer */}
      {selectedStyle === 'adventurer' && (
        <div className="space-y-4">
          <Label className="text-white">Couleur de fond</Label>
          <Select
            value={options.backgroundColor || 'transparent'}
            onValueChange={(value) => handleOptionChange('backgroundColor', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choisir une couleur" />
            </SelectTrigger>
            <SelectContent>
              {adventurerOptions.backgroundColor.map((color) => (
                <SelectItem key={color.id} value={color.id}>
                  {color.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {/* Bouton pour appliquer les changements */}
      <Button 
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
        onClick={updateAvatar}
      >
        Appliquer
      </Button>
    </div>
  );
} 