'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShineBorder } from '@/components/magicui/shine-border';
import { api } from '@/lib/api';
import AvatarSelector from '@/components/Profile/AvatarSelector';

// Interfaces
interface User {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
}

interface ProfileFormData {
  username: string;
  email: string;
}

interface PasswordFormData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

// Interfaces pour les options de notification
type NotificationOption = 'email_notifications' | 'push_notifications' | 'sound_notifications';

interface PreferencesData {
  theme: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sound_notifications: boolean;
}

// Composants réutilisables
interface FormCardProps {
  title: string;
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const FormCard: React.FC<FormCardProps> = ({ title, children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/10 relative h-fit ${className}`}
  >
    <ShineBorder borderWidth={1} duration={14} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
    <h2 className="text-xl font-bold text-white mb-6">{title}</h2>
    {children}
  </motion.div>
);

interface FormButtonProps {
  isLoading: boolean;
  loadingText: string;
  text: string;
  onClick?: () => void;
  type?: "submit" | "button" | "reset";
}

const FormButton: React.FC<FormButtonProps> = ({ isLoading, loadingText, text, onClick, type = "submit" }) => (
  <motion.button
    type={type}
    className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 mt-6"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    disabled={isLoading}
    onClick={onClick}
  >
    {isLoading ? (
      <div className="flex items-center justify-center">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {loadingText}
      </div>
    ) : text}
  </motion.button>
);

interface FormInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  minLength?: number | null;
  helpText?: string | null;
}

const FormInput: React.FC<FormInputProps> = ({ id, label, type = "text", value, onChange, required = false, minLength = null, helpText = null }) => (
  <div>
    <label htmlFor={id} className="block text-gray-400 mb-1 text-sm">
      {label}
    </label>
    <input
      id={id}
      type={type}
      name={id}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
      required={required}
      minLength={minLength || undefined}
    />
    {helpText && <p className="text-xs text-gray-400 mt-1">{helpText}</p>}
  </div>
);

interface StatusMessageProps {
  type: 'error' | 'success';
  message: string | null;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ type, message }) => {
  if (!message) return null;
  
  const bgColor = type === 'error' ? 'bg-red-500/20 border-red-500/50' : 'bg-green-500/20 border-green-500/50';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${bgColor} text-white p-3 rounded-lg mb-4 border`}
    >
      {message.split('\n').map((line, i) => (
        <div key={i} className={i > 0 ? 'mt-1' : ''}>
          {line}
        </div>
      ))}
    </motion.div>
  );
};

// Contexte de thème
interface ThemeContextType {
  currentTheme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: 'système',
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

// Fournisseur de thème pour l'application entière
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState('système');
  
  // Charger le thème depuis localStorage au chargement
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);
  
  // Fonction pour appliquer le thème à l'interface
  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    
    // Supprimer toutes les classes de thème
    root.classList.remove('theme-light', 'theme-dark', 'theme-neon');
    
    // Appliquer la nouvelle classe de thème
    if (theme === 'clair') {
      root.classList.add('theme-light');
    } else if (theme === 'sombre') {
      root.classList.add('theme-dark');
    } else if (theme === 'néon') {
      root.classList.add('theme-neon');
    } else {
      // Thème système - détecter les préférences du système
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
    }
  };
  
  // Fonction pour définir le thème
  const setTheme = (theme: string) => {
    setCurrentTheme(theme);
    localStorage.setItem('theme', theme);
    applyTheme(theme);
  };
  
  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Page principale
export default function ProfileSettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  // Séparation des états de formulaire
  const [profileData, setProfileData] = useState<ProfileFormData>({
    username: '',
    email: '',
  });
  
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  
  const [preferences, setPreferences] = useState<PreferencesData>({
    theme: 'système',
    email_notifications: false,
    push_notifications: false,
    sound_notifications: false,
  });

  const { currentTheme, setTheme } = useTheme();
  
  useEffect(() => {
    // Charger les données de l'utilisateur
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get('user');
        
        if (response.success && response.data) {
          const userData = response.data;
          setUser(userData);
          
          // Mettre à jour le formulaire avec les données du profil
          setProfileData({
            username: userData.username,
            email: userData.email,
          });
        }
      } catch (error: any) {
        setError('Erreur de chargement du profil: ' + (error.message || 'Une erreur est survenue'));
        console.error('Erreur lors du chargement du profil:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    // Mise à jour des préférences pour inclure le thème actuel
    setPreferences(prev => ({
      ...prev,
      theme: currentTheme
    }));
  }, [currentTheme]);

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox' && (
      name === 'email_notifications' || 
      name === 'push_notifications' || 
      name === 'sound_notifications'
    )) {
      // Pour les checkboxes de notification
      setPreferences(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'theme') {
      // Pour les boutons radio de thème
      setPreferences(prev => ({
        ...prev,
        theme: value
      }));
      // Appliquer le thème immédiatement
      setTheme(value);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSavingProfile(true);

    try {
      const response = await api.put('user', profileData);
      
      if (response.success) {
        setSuccess('Profil mis à jour avec succès');
        // Mettre à jour les données utilisateur locales
        setUser(prev => prev ? { ...prev, ...profileData } : null);
      }
    } catch (error: any) {
      setError('Erreur lors de la mise à jour du profil: ' + (error.message || 'Une erreur est survenue'));
      console.error('Erreur lors de la mise à jour du profil:', error);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSavingPassword(true);

    // Vérifier que les mots de passe correspondent
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      setIsSavingPassword(false);
      return;
    }

    try {
      const passwordPayload = {
        current_password: passwordData.current_password,
        password: passwordData.new_password,
        password_confirmation: passwordData.new_password_confirmation,
      };

      const response = await api.put('user/password', passwordPayload);
      
      if (response.success) {
        setSuccess('Mot de passe mis à jour avec succès');
        // Réinitialiser les champs de mot de passe
        setPasswordData({
          current_password: '',
          new_password: '',
          new_password_confirmation: '',
        });
      }
    } catch (error: any) {
      setError('Erreur lors de la mise à jour du mot de passe: ' + (error.message || 'Une erreur est survenue'));
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
    } finally {
      setIsSavingPassword(false);
    }
  };
  
  const handlePreferencesUpdate = async () => {
    setError(null);
    setSuccess(null);
    setIsSavingPreferences(true);
    
    try {
      // Simulation de mise à jour des préférences
      await new Promise(resolve => setTimeout(resolve, 800));
      setSuccess('Préférences mises à jour avec succès');
    } catch (error: any) {
      setError('Erreur lors de la mise à jour des préférences');
    } finally {
      setIsSavingPreferences(false);
    }
  };

  // Fonction pour mettre à jour l'avatar
  const updateAvatar = async (newAvatarUrl: string) => {
    if (!user) return;
    
    try {
      setIsSavingProfile(true);
      setError(null);
      
      // Mettre à jour l'avatar dans la base de données
      const response = await api.put('user', {
        avatar: newAvatarUrl
      });
      
      if (response.success) {
        setUser(prev => prev ? { ...prev, avatar: newAvatarUrl } : null);
        setSuccess('Avatar mis à jour avec succès');
      }
    } catch (error: any) {
      setError('Erreur lors de la mise à jour de l\'avatar: ' + (error.message || 'Une erreur est survenue'));
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white mb-8"
        >
          Paramètres du profil
        </motion.h1>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 relative z-10">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-white mb-8"
      >
        Paramètres du profil
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Carte de profil */}
        <FormCard title="Informations de profil" delay={0.1}>
          <StatusMessage type="error" message={error} />
          <StatusMessage type="success" message={success} />

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            {/* Avatar */}
            <AvatarSelector 
              initialAvatar={user?.avatar}
              username={user?.username || ''}
              onAvatarChange={updateAvatar}
            />

            <FormInput 
              id="username"
              label="Nom d'utilisateur"
              value={profileData.username}
              onChange={handleProfileInputChange}
              required
            />

            <FormInput 
              id="email"
              label="Email"
              type="email"
              value={profileData.email}
              onChange={handleProfileInputChange}
              required
            />

            <FormButton 
              isLoading={isSavingProfile}
              loadingText="Sauvegarde en cours..."
              text="Enregistrer les modifications"
            />
          </form>
        </FormCard>

        {/* Carte de changement de mot de passe */}
        <FormCard title="Modifier le mot de passe" delay={0.2}>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <FormInput 
              id="current_password"
              label="Mot de passe actuel"
              type="password"
              value={passwordData.current_password}
              onChange={handlePasswordInputChange}
              required
            />

            <FormInput 
              id="new_password"
              label="Nouveau mot de passe"
              type="password"
              value={passwordData.new_password}
              onChange={handlePasswordInputChange}
              required
              minLength={8}
              helpText="Doit contenir au moins 8 caractères"
            />

            <FormInput 
              id="new_password_confirmation"
              label="Confirmer le nouveau mot de passe"
              type="password"
              value={passwordData.new_password_confirmation}
              onChange={handlePasswordInputChange}
              required
            />

            <FormButton 
              isLoading={isSavingPassword}
              loadingText="Mise à jour en cours..."
              text="Modifier le mot de passe"
            />
          </form>
        </FormCard>

        {/* Carte des préférences */}
        <FormCard title="Préférences" delay={0.3} className="md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Préférences de thème */}
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Thème de l'interface</h3>
              <div className="space-y-3">
                {[
                  { value: 'système', label: 'Système' },
                  { value: 'clair', label: 'Clair' },
                  { value: 'sombre', label: 'Sombre' },
                  { value: 'néon', label: 'Néon' }
                ].map((theme) => (
                  <label key={theme.value} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="theme"
                      value={theme.value}
                      checked={preferences.theme === theme.value}
                      onChange={handlePreferenceChange}
                      className="form-radio h-5 w-5 text-indigo-500 border-white/30 focus:ring-indigo-500 focus:ring-opacity-50 bg-white/5"
                    />
                    <span className="text-gray-300">{theme.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Préférences de notifications */}
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Notifications</h3>
              <div className="space-y-3">
                {[
                  { id: 'email_notifications' as NotificationOption, label: 'Notifications par email' },
                  { id: 'push_notifications' as NotificationOption, label: 'Notifications push' },
                  { id: 'sound_notifications' as NotificationOption, label: 'Sons de notification' },
                ].map((option) => (
                  <label key={option.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name={option.id}
                      checked={preferences[option.id]}
                      onChange={handlePreferenceChange}
                      className="form-checkbox h-5 w-5 text-indigo-500 border-white/30 focus:ring-indigo-500 focus:ring-opacity-50 bg-white/5"
                    />
                    <span className="text-gray-300">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <FormButton 
            isLoading={isSavingPreferences}
            loadingText="Enregistrement en cours..."
            text="Enregistrer les préférences"
            onClick={handlePreferencesUpdate}
            type="button"
          />
        </FormCard>
      </div>
    </div>
  );
} 