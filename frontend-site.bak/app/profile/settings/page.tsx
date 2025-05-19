'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Particles } from '@/components/magicui/particles';
import { ShineBorder } from '@/components/magicui/shine-border';
import { apiService } from '@/lib/api-service';
import ThemePreview from '@/components/ThemePreview';

interface Theme {
  id: string;
  name: string;
  description: string;
  previewUrl: string;
  isPremium: boolean;
}

interface UserSettings {
  theme: string;
  notifications: boolean;
  language: string;
  soundEffects: boolean;
  darkMode: 'light' | 'dark' | 'system';
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'default',
    notifications: true,
    language: 'fr',
    soundEffects: true,
    darkMode: 'system'
  });
  
  const [themes, setThemes] = useState<Theme[]>([]);
  const [availableAvatars, setAvailableAvatars] = useState<string[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [customAvatar, setCustomAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Charger les préférences de l'utilisateur
        const userData = await apiService.getCurrentUser();
        if (userData.preferences) {
          setSettings({
            theme: userData.preferences.theme || 'default',
            notifications: userData.preferences.notifications ?? true,
            language: userData.preferences.language || 'fr',
            soundEffects: userData.preferences.soundEffects ?? true,
            darkMode: userData.preferences.darkMode || 'system'
          });
        }
        
        setSelectedAvatar(userData.avatar || '');
        
        // Charger les thèmes disponibles
        try {
          const themesData = await apiService.getThemes();
          setThemes(themesData);
        } catch (e) {
          // Utiliser des thèmes par défaut si l'API n'est pas disponible
          setThemes(defaultThemes);
        }
        
        // Charger les avatars disponibles
        try {
          const avatarsData = await apiService.getAvatars();
          setAvailableAvatars(avatarsData);
        } catch (e) {
          // Utiliser des avatars par défaut si l'API n'est pas disponible
          setAvailableAvatars(defaultAvatars);
        }
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des paramètres');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleChangeSettings = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };
  
  const handleSelectAvatar = (avatar: string) => {
    setSelectedAvatar(avatar);
    setCustomAvatar(null);
    setAvatarPreview('');
  };
  
  const handleCustomAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCustomAvatar(file);
      
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      setSelectedAvatar('');
    }
  };
  
  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      setError('');
      setSuccessMessage('');
      
      // Mettre à jour les préférences utilisateur
      await apiService.updateUserProfile({
        preferences: {
          theme: settings.theme,
          notifications: settings.notifications,
          language: settings.language,
          soundEffects: settings.soundEffects,
          darkMode: settings.darkMode
        }
      });
      
      // Mettre à jour l'avatar si nécessaire
      if (selectedAvatar) {
        await apiService.updateUserProfile({ avatar: selectedAvatar });
      } else if (customAvatar) {
        // Cette API n'est pas encore implémentée
        await apiService.uploadAvatar(customAvatar);
      }
      
      setSuccessMessage('Paramètres enregistrés avec succès !');
      
      // Disparition du message après 3 secondes
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde des paramètres');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D111E] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500 border-r-2 border-indigo-500 mb-4"></div>
          <p>Chargement des paramètres...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#0D111E] relative overflow-hidden">
      <Particles className="absolute inset-0" />
      <Particles className="absolute inset-0" quantity={30} color="#4f46e5" size={0.8} />
      <Particles className="absolute inset-0" quantity={20} color="#7c3aed" size={1.2} />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <Link href="/profile">
              <div className="flex items-center gap-4">
                <Image
                  src="/img/logo6.png"
                  alt="RTFM2Win Logo"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <span className="text-white">Retour au profil</span>
              </div>
            </Link>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 mb-8">
            <h1 className="text-3xl font-bold text-white mb-6">Paramètres</h1>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-red-400 text-sm">
                {error}
              </div>
            )}
            
            {successMessage && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6 text-green-400 text-sm">
                {successMessage}
              </div>
            )}
            
            <div className="space-y-8">
              {/* Section Avatar */}
              <div>
                <h2 className="text-white font-semibold text-xl mb-4">Avatar</h2>
                <div className="flex flex-col md:flex-row items-start gap-8">
                  <div className="flex-shrink-0">
                    <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-5xl font-bold overflow-hidden">
                      {avatarPreview ? (
                        <Image
                          src={avatarPreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      ) : selectedAvatar ? (
                        <Image
                          src={selectedAvatar}
                          alt="Avatar"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        "U"
                      )}
                    </div>
                  </div>
                  
                  <div className="w-full">
                    <h3 className="text-white font-medium mb-3">Choisir un avatar</h3>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mb-4">
                      {availableAvatars.map((avatar, index) => (
                        <div
                          key={index}
                          onClick={() => handleSelectAvatar(avatar)}
                          className={`w-16 h-16 rounded-full overflow-hidden cursor-pointer border-2 transition-all ${
                            selectedAvatar === avatar
                              ? 'border-indigo-500 scale-110'
                              : 'border-transparent hover:border-indigo-500/50'
                          }`}
                        >
                          <Image
                            src={avatar}
                            alt={`Avatar ${index + 1}`}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ))}
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-gray-400 text-sm mb-2">Ou téléchargez votre propre avatar</p>
                      <label className="flex items-center justify-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl cursor-pointer transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                        </svg>
                        <span>Importer une image</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleCustomAvatarChange}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Section Thème */}
              <div>
                <h2 className="text-white font-semibold text-xl mb-4">Thème</h2>
                
                <div className="mb-6">
                  <h3 className="text-white font-medium mb-3">Mode d'affichage</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div
                      onClick={() => handleChangeSettings('darkMode', 'light')}
                      className={`bg-white/10 hover:bg-white/20 rounded-xl p-4 cursor-pointer transition-all ${
                        settings.darkMode === 'light' ? 'border-2 border-indigo-500' : 'border-2 border-transparent'
                      }`}
                    >
                      <div className="w-full h-12 bg-white rounded-lg mb-3"></div>
                      <p className="text-white text-center">Clair</p>
                    </div>
                    
                    <div
                      onClick={() => handleChangeSettings('darkMode', 'dark')}
                      className={`bg-white/10 hover:bg-white/20 rounded-xl p-4 cursor-pointer transition-all ${
                        settings.darkMode === 'dark' ? 'border-2 border-indigo-500' : 'border-2 border-transparent'
                      }`}
                    >
                      <div className="w-full h-12 bg-[#0D111E] rounded-lg mb-3"></div>
                      <p className="text-white text-center">Sombre</p>
                    </div>
                    
                    <div
                      onClick={() => handleChangeSettings('darkMode', 'system')}
                      className={`bg-white/10 hover:bg-white/20 rounded-xl p-4 cursor-pointer transition-all ${
                        settings.darkMode === 'system' ? 'border-2 border-indigo-500' : 'border-2 border-transparent'
                      }`}
                    >
                      <div className="w-full h-12 bg-gradient-to-r from-white to-[#0D111E] rounded-lg mb-3"></div>
                      <p className="text-white text-center">Système</p>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-white font-medium mb-3">Thèmes disponibles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {themes.map((theme) => (
                    <ThemePreview
                      key={theme.id}
                      theme={{
                        ...theme,
                        colors: getThemeColors(theme.id)
                      }}
                      isSelected={settings.theme === theme.id}
                      onSelect={(themeId) => handleChangeSettings('theme', themeId)}
                    />
                  ))}
                </div>
              </div>
              
              {/* Section Préférences */}
              <div>
                <h2 className="text-white font-semibold text-xl mb-4">Préférences</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Notifications</h3>
                      <p className="text-gray-400 text-sm">Recevoir des notifications sur les nouveaux quiz et résultats</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={settings.notifications}
                        onChange={(e) => handleChangeSettings('notifications', e.target.checked)}
                      />
                      <div className={`w-11 h-6 rounded-full transition-all ${
                        settings.notifications ? 'bg-indigo-500' : 'bg-white/20'
                      }`}>
                        <div className={`absolute w-5 h-5 bg-white rounded-full transition-all ${
                          settings.notifications ? 'translate-x-5' : 'translate-x-1'
                        } top-0.5`}></div>
                      </div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Effets sonores</h3>
                      <p className="text-gray-400 text-sm">Activer les sons dans l'application</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={settings.soundEffects}
                        onChange={(e) => handleChangeSettings('soundEffects', e.target.checked)}
                      />
                      <div className={`w-11 h-6 rounded-full transition-all ${
                        settings.soundEffects ? 'bg-indigo-500' : 'bg-white/20'
                      }`}>
                        <div className={`absolute w-5 h-5 bg-white rounded-full transition-all ${
                          settings.soundEffects ? 'translate-x-5' : 'translate-x-1'
                        } top-0.5`}></div>
                      </div>
                    </label>
                  </div>
                  
                  <div>
                    <h3 className="text-white font-medium mb-2">Langue</h3>
                    <select
                      value={settings.language}
                      onChange={(e) => handleChangeSettings('language', e.target.value)}
                      className="w-full bg-white/10 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <ShineBorder>
                <motion.button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium disabled:opacity-50"
                >
                  {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </motion.button>
              </ShineBorder>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Données par défaut pour les tests
const defaultThemes: Theme[] = [
  {
    id: 'default',
    name: 'Thème par défaut',
    description: 'Le thème standard de RTFM2Win avec des tons de bleu et violet',
    previewUrl: '/img/themes/default.jpg',
    isPremium: false
  },
  {
    id: 'dark',
    name: 'Obscurité',
    description: 'Un thème sombre avec des accents de couleur subtils',
    previewUrl: '/img/themes/dark.jpg',
    isPremium: false
  },
  {
    id: 'neon',
    name: 'Néon',
    description: 'Un thème vibrant avec des couleurs néon sur fond sombre',
    previewUrl: '/img/themes/neon.jpg',
    isPremium: true
  },
  {
    id: 'nature',
    name: 'Nature',
    description: 'Un thème rafraîchissant inspiré par la nature',
    previewUrl: '/img/themes/nature.jpg',
    isPremium: true
  }
];

// Fonction pour récupérer les couleurs d'un thème
function getThemeColors(themeId: string) {
  const themeColors = {
    default: {
      primary: '#4f46e5',
      secondary: '#7c3aed',
      background: '#0D111E',
      text: '#ffffff',
      accent: 'rgba(255,255,255,0.1)'
    },
    dark: {
      primary: '#6366f1',
      secondary: '#0f172a',
      background: '#1e293b',
      text: '#e2e8f0',
      accent: 'rgba(226,232,240,0.1)'
    },
    neon: {
      primary: '#f0abfc',
      secondary: '#818cf8',
      background: '#09090b',
      text: '#fafafa',
      accent: 'rgba(240,171,252,0.2)'
    },
    nature: {
      primary: '#10b981',
      secondary: '#34d399',
      background: '#064e3b',
      text: '#ecfdf5',
      accent: 'rgba(16,185,129,0.2)'
    }
  };
  
  return themeColors[themeId as keyof typeof themeColors] || themeColors.default;
}

const defaultAvatars: string[] = [
  '/img/avatars/avatar1.png',
  '/img/avatars/avatar2.png',
  '/img/avatars/avatar3.png',
  '/img/avatars/avatar4.png',
  '/img/avatars/avatar5.png',
  '/img/avatars/avatar6.png',
  '/img/avatars/avatar7.png',
  '/img/avatars/avatar8.png',
]; 