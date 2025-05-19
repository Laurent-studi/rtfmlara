'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import TransitionLayout from './TransitionLayout';
import { useTheme } from '../../../hooks/useTheme';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { theme } = useTheme();
  
  return (
    <div className={`flex flex-col min-h-screen ${theme}`}>
      <TransitionLayout>
        <Header />
        <main className="flex-grow bg-background">
          {children}
        </main>
        <Footer />
      </TransitionLayout>
    </div>
  );
} 