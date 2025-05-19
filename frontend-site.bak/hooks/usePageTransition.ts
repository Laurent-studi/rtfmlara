"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  const navigateWithTransition = useCallback((path: string) => {
    setIsTransitioning(true);
    
    // Attendre que l'animation de transition soit terminée avant de naviguer
    setTimeout(() => {
      router.push(path);
    }, 500); // Ajustez ce délai en fonction de la durée de votre animation
  }, [router]);

  const completeTransition = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  return {
    isTransitioning,
    navigateWithTransition,
    completeTransition
  };
} 