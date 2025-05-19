'use client';

import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import ThemePreview from '../components/ThemePreview';
import { useTheme } from '../../hooks/useTheme';
import { ShineBorder } from '../components/magicui/shine-border';
import { motion } from 'framer-motion';
import Image from 'next/image';

// Thèmes disponibles pour la démo
const availableThemes = [
  {
    id: 'theme-default',
    name: 'Thème par défaut',
    description: 'Le thème standard de RTFM2Win avec des tons de bleu et violet',
    previewUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1470&auto=format&fit=crop',
    isPremium: false,
    colors: {
      primary: '#4f46e5',
      secondary: '#7c3aed',
      background: '#0D111E',
      text: '#ffffff',
      accent: 'rgba(255,255,255,0.1)'
    }
  },
  {
    id: 'theme-neon',
    name: 'Néon',
    description: 'Un thème vibrant avec des couleurs néon sur fond sombre',
    previewUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1470&auto=format&fit=crop',
    isPremium: true,
    colors: {
      primary: '#f0abfc',
      secondary: '#818cf8',
      background: '#09090b',
      text: '#fafafa',
      accent: 'rgba(240,171,252,0.2)'
    }
  },
  {
    id: 'theme-nature',
    name: 'Nature',
    description: 'Un thème rafraîchissant inspiré par la nature',
    previewUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1374&auto=format&fit=crop',
    isPremium: true,
    colors: {
      primary: '#10b981',
      secondary: '#34d399',
      background: '#064e3b',
      text: '#ecfdf5',
      accent: 'rgba(16,185,129,0.2)'
    }
  }
];

export default function HomePage() {
  const { theme, setTheme } = useTheme();
  
  // Placeholder images jusqu'à ce que nous ayons des vraies images
  const placeholderImages = [
    'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1374&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1470&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1470&auto=format&fit=crop',
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero section */}
        <div className="flex flex-col items-center justify-center text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-4">
            Bienvenue sur RTFM2Win
          </h1>
          <p className="text-lg text-foreground/80 max-w-2xl mb-8">
            La plateforme interactive pour créer, partager et participer à des quiz
            sur tous les sujets. Testez vos connaissances et défiez vos amis !
          </p>
          <div className="relative">
            <button className="btn-primary text-lg px-8 py-3">
              Commencer maintenant
            </button>
            <ShineBorder shineColor={['#4f46e5', '#7c3aed', '#9333ea']} />
          </div>
        </div>

        {/* Thèmes section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Personnalisez votre expérience</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availableThemes.map((themeItem) => (
              <ThemePreview
                key={themeItem.id}
                theme={themeItem}
                isSelected={theme === themeItem.id}
                onSelect={setTheme}
              />
            ))}
          </div>
        </div>

        {/* Featured quizzes */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Quiz populaires</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((_, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="card overflow-hidden"
              >
                <div className="relative h-40 -mx-4 -mt-4 mb-4">
                  <Image
                    src={placeholderImages[index]}
                    alt={`Quiz populaire ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
                  <div className="absolute bottom-2 left-4 right-4">
                    <span className="bg-primary/80 text-primary-foreground text-xs py-1 px-2 rounded-full">
                      {index === 0 ? 'Informatique' : index === 1 ? 'Culture générale' : 'Science'}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Quiz {index === 0 ? 'Programmation Web' : index === 1 ? 'Culture Générale' : 'Astronomie'}</h3>
                <p className="text-foreground/70 text-sm mb-4">
                  {index === 0 
                    ? 'Testez vos connaissances en développement web avec ce quiz complet.'
                    : index === 1 
                      ? 'Un quiz varié pour tester votre culture générale sur différents sujets.'
                      : 'Explorez les mystères de l\'univers avec ce quiz sur l\'astronomie.'}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-foreground/50 text-sm">
                    20 questions
                  </span>
                  <button className="btn-primary">
                    Jouer
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div className="bg-card p-8 rounded-xl text-center">
          <h2 className="text-2xl font-bold mb-4">Prêt à créer votre propre quiz ?</h2>
          <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">
            Inscrivez-vous gratuitement et commencez à créer des quiz personnalisés
            pour vos amis, vos collègues ou votre communauté.
          </p>
          <button className="btn-secondary">
            Créer un compte
          </button>
        </div>
      </div>
    </Layout>
  );
} 