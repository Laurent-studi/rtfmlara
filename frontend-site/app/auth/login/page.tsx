'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Particles } from '@/components/magicui/particles';
import { ShineBorder } from '@/components/magicui/shine-border';
import { api } from '@/lib/api';
import Link from 'next/link';
import AuthLayout from '../auth-layout';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post('login', formData);
      
      // Déboguer la structure de la réponse
      console.log('Structure de la réponse login:', response);
      
      // Chercher le token d'authentification à différents endroits possibles de la réponse
      let token = null;
      if (response.access_token) {
        token = response.access_token;
      } else if (response.data && response.data.access_token) {
        token = response.data.access_token;
      } else if (response.token) {
        token = response.token;
      } else if (response.data && response.data.token) {
        token = response.data.token;
      }
      
      if (token) {
        // Sauvegarder le token d'authentification
        localStorage.setItem('auth_token', token);
        console.log('Token d\'authentification sauvegardé:', token.substring(0, 10) + '...');
        
        // Rediriger vers le tableau de bord
        router.push('/dashboard');
      } else {
        console.error('Token introuvable dans la réponse:', response);
        setError('Format de réponse inattendu: token introuvable');
      }
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      setError(error.message || 'Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Connexion</h1>
        <p className="text-gray-400 mt-2">Connectez-vous à votre compte RTFM2Win</p>
      </div>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-white p-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-gray-400 mb-1">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-gray-400 mb-1">Mot de passe</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            required
          />
        </div>
        
        <div className="text-right">
          <Link href="/auth/forgot-password" className="text-indigo-400 hover:text-indigo-300 text-sm">
            Mot de passe oublié ?
          </Link>
        </div>
        
        <button
          type="submit"
          className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 mt-6"
          disabled={isLoading}
        >
          {isLoading ? 'Connexion en cours...' : 'Se connecter'}
        </button>
        
        <div className="text-center mt-6">
          <p className="text-gray-400">
            Vous n'avez pas de compte ?{' '}
            <Link href="/auth/register" className="text-indigo-400 hover:text-indigo-300">
              Inscrivez-vous
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
} 