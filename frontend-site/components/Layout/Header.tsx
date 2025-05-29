import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../app/providers/ThemeProvider';

export default function Header() {
  const { currentTheme, themes, isLoading: themeLoading, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };

    // Empêcher le défilement du body quand le menu mobile est ouvert
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const themeId = parseInt(e.target.value);
    if (!isNaN(themeId)) {
      const themeExists = themes.some(theme => theme.id === themeId);
      if (themeExists) {
        setTheme(themeId);
      }
    }
  };

  const toggleThemeMenu = () => {
    setThemeMenuOpen(!themeMenuOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Fermeture des menus lors du clic sur un lien
  const handleLinkClick = () => {
    setMobileMenuOpen(false);
    setThemeMenuOpen(false);
  };

  // Fermeture du menu lors du clic sur l'overlay
  const handleOverlayClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-xl border-border transition-all duration-300 ${isScrolled ? 'shadow-lg' : 'shadow-sm'}`} style={{ backgroundColor: 'var(--background)', opacity: 0.85, borderBottomWidth: '1px', borderBottomColor: 'var(--border)' }}>
      <div className="flex justify-between items-center px-8 py-4 max-w-6xl mx-auto relative">
        <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105 z-50" onClick={handleLinkClick}>
          <Image
            src="/img/logo4.png"
            alt="RTFM2Win Logo"
            width={40}
            height={40}
            className="rounded-lg object-contain drop-shadow-sm"
          />
          <span className="font-bold text-xl tracking-tight text-transparent" style={{ background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>
            RTFM2Win Le quizz de la RTFM
          </span>
        </Link>
        
        {/* Menu hamburger pour mobile */}
        <button 
          className={`md:hidden flex flex-col gap-1 w-6 h-6 z-50 ${mobileMenuOpen ? 'transform' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Menu de navigation"
        >
          <span className={`block h-0.5 w-full bg-foreground transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
          <span className={`block h-0.5 w-full bg-foreground transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block h-0.5 w-full bg-foreground transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
        </button>
        
        {/* Overlay pour le menu mobile */}
        <div 
          className={`fixed inset-0 backdrop-blur-sm z-40 transition-opacity md:hidden ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={handleOverlayClick}
        ></div>
        
        {/* Navigation principale */}
        <nav className={`flex items-center gap-6 md:flex ${mobileMenuOpen ? 'fixed top-0 right-0 h-full w-80 bg-card border-l border-border flex-col justify-start pt-20 px-6 z-50' : 'hidden md:flex'}`}>
          <Link href="/" className="relative text-foreground font-medium py-2 transition-colors hover:text-primary group" onClick={handleLinkClick}>
            Accueil
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full rounded-full"></span>
          </Link>
          <Link href="/quiz/join" className="relative text-foreground font-medium py-2 transition-colors hover:text-primary group" onClick={handleLinkClick}>
            Rejoindre
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full rounded-full"></span>
          </Link>
          <Link href="/quiz/search" className="relative text-foreground font-medium py-2 transition-colors hover:text-primary group" onClick={handleLinkClick}>
            Explorer
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full rounded-full"></span>
          </Link>
          <Link href="/auth/login" className="relative text-foreground font-medium py-2 transition-colors hover:text-primary group" onClick={handleLinkClick}>
            Connexion
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full rounded-full"></span>
          </Link>
          <Link href="/auth/register" className="px-5 py-2 bg-primary text-primary-foreground rounded-lg font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg" onClick={handleLinkClick}>
            Inscription
          </Link>
          
          <div className="relative ml-3">
            <button
              onClick={toggleThemeMenu}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-card border border-border text-foreground transition-all hover:bg-primary hover:text-primary-foreground hover:rotate-30"
              aria-label="Sélectionner un thème"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"></path>
              </svg>
            </button>
            
            <AnimatePresence>
              {themeMenuOpen && isMounted && (
                <motion.div 
                  className="absolute top-full right-0 mt-2 bg-card border border-border rounded-lg p-2 shadow-xl min-w-48 z-50 backdrop-blur-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <select 
                    className="w-full p-2 bg-background border border-border text-foreground rounded-md text-sm cursor-pointer transition-colors hover:border-primary focus:border-primary focus:outline-none"
                    value={currentTheme?.id || ''}
                    onChange={handleThemeChange}
                  >
                    {themes.map(theme => (
                      <option key={theme.id} value={theme.id}>
                        {theme.name}
                      </option>
                    ))}
                  </select>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>
      </div>
    </header>
  );
} 