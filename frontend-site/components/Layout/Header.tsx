import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../app/providers/ThemeProvider';
import styles from './Header.module.css';

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
    <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
      <div className={styles.headerContainer}>
        <Link href="/" className={styles.logo} onClick={handleLinkClick}>
          <Image
            src="/img/logo4.png"
            alt="RTFM2Win Logo"
            width={40}
            height={40}
            className={styles.logoImg}
          />
          <span className={styles.logoText}>RTFM2Win Le quizz de la RTFM</span>
        </Link>
        
        {/* Menu hamburger pour mobile */}
        <button 
          className={`${styles.mobileMenuButton} ${mobileMenuOpen ? styles.mobileMenuActive : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Menu de navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        {/* Overlay pour le menu mobile */}
        <div 
          className={`${styles.overlay} ${mobileMenuOpen ? styles.overlayVisible : ''}`}
          onClick={handleOverlayClick}
        ></div>
        
        {/* Navigation principale */}
        <nav className={`${styles.nav} ${mobileMenuOpen ? styles.navMobileOpen : ''}`}>
          <Link href="/" className={`${styles.navItem} ${styles.navItemActive}`} onClick={handleLinkClick}>
            Accueil
          </Link>
          <Link href="/quiz/join" className={styles.navItem} onClick={handleLinkClick}>
            Rejoindre
          </Link>
          <Link href="/quiz/search" className={styles.navItem} onClick={handleLinkClick}>
            Explorer
          </Link>
          <Link href="/auth/login" className={styles.navItem} onClick={handleLinkClick}>
            Connexion
          </Link>
          <Link href="/auth/register" className={styles.navButton} onClick={handleLinkClick}>
            Inscription
          </Link>
          
          <div className={styles.themeSelector}>
            <button
              onClick={toggleThemeMenu}
              className={styles.themeSelectButton}
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
                  className={styles.themeSelectorDropdown}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <select 
                    className={styles.themeSelect}
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