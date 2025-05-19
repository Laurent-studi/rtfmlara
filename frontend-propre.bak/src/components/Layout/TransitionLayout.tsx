"use client";

import { ReactNode } from 'react';
import PageTransitionSquares from '../Effects/PageTransitionSquares';
import { usePageTransition } from '../../../hooks/usePageTransition';

interface TransitionLayoutProps {
  children: ReactNode;
}

export default function TransitionLayout({ children }: TransitionLayoutProps) {
  const { isTransitioning, completeTransition } = usePageTransition();

  return (
    <>
      {children}
      <PageTransitionSquares 
        isVisible={isTransitioning} 
        onComplete={completeTransition} 
      />
    </>
  );
} 