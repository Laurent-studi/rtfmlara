'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from './providers/ThemeProvider';
import Link from 'next/link';
import styles from './page.module.css';
import Header from '../components/Layout/Header';

// Interface pour le type Quiz
interface Quiz {
  id: number;
  title: string;
  questions_count: number;
  category: string;
  description?: string;
}

export default function HomePage() {
  const router = useRouter();
  const [quizCode, setQuizCode] = useState('');
  const { currentTheme, themes, isLoading: themeLoading, setTheme } = useTheme();
  const [featuredQuizzes, setFeaturedQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Effet pour marquer que le composant est monté côté client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Charger les quiz vedettes depuis l'API backend
    const loadFeaturedQuizzes = async () => {
      try {
        // Utiliser l'URL directe du backend Laravel
        const response = await fetch('http://localhost:8000/api/quizzes/featured');
        if (response.ok) {
          const data = await response.json();
          setFeaturedQuizzes(data.data || []);
        } else {
          throw new Error(`Erreur: ${response.status}`);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des quiz vedettes:', error);
        // En cas d'erreur, utiliser des données factices
        setFeaturedQuizzes([
          { id: 1, title: 'Quiz de Programmation', questions_count: 10, category: 'Informatique' },
          { id: 2, title: 'Quiz de Culture Générale', questions_count: 15, category: 'Culture' },
          { id: 3, title: 'Quiz de Sciences', questions_count: 8, category: 'Sciences' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isMounted) {
      loadFeaturedQuizzes();
    }
  }, [isMounted]);

  const handleJoinQuiz = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (quizCode.trim()) {
      router.push(`/quiz/${quizCode}`);
    }
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const themeId = parseInt(e.target.value);
    if (!isNaN(themeId)) {
      // Vérifier que le thème existe avant de le définir
      const themeExists = themes.some(theme => theme.id === themeId);
      if (themeExists) {
        setTheme(themeId);
      } else {
        console.error(`Thème avec l'ID ${themeId} non disponible dans la liste des thèmes`);
      }
    }
  };

  // Valeurs par défaut pour le rendu côté serveur
  const defaultQuizzes: Quiz[] = [
    { id: 1, title: 'Quiz de Programmation', questions_count: 10, category: 'Informatique' },
    { id: 2, title: 'Quiz de Culture Générale', questions_count: 15, category: 'Culture' },
    { id: 3, title: 'Quiz de Sciences', questions_count: 8, category: 'Sciences' }
  ];

  // Si le composant n'est pas encore monté côté client, utiliser des valeurs par défaut
  const displayedQuizzes = isMounted ? featuredQuizzes : defaultQuizzes;
  const showLoading = isMounted && isLoading;

  return (
    <div className="min-h-screen flex flex-col">
      {/* En-tête */}
      <Header />

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <motion.h1 
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Créez et Partagez vos Quiz Interactifs<br />en Temps Réel
          </motion.h1>
          
          <div className={styles.heroSeparator}></div>
          
          <motion.p 
            className={styles.heroSubtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Engagez votre audience avec des quiz en direct ! Parfait pour les enseignants, formateurs ou pour animer vos événements.
          </motion.p>
          
          <motion.div 
            className={styles.heroCta}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link 
              href="/quiz/create" 
              className={styles.ctaButton}
            >
              Commencer Gratuitement
            </Link>
            <Link 
              href="/quiz/join" 
              className="btn-classic btn-classic-outline px-6 py-3 rounded"
            >
              Rejoindre un Quiz
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* Pourquoi notre plateforme */}
      <section className={styles.featureSection}>
        <div className={styles.container}>
          <div className={styles.sectionTitle}>
            <h2>Pourquoi choisir notre plateforme ?</h2>
            <div className={styles.separator}></div>
          </div>
          
          <div className={styles.featureGrid}>
            <motion.div 
              className={styles.featureCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className={styles.featureIcon}>
                {isMounted ? (
                  <Image src="/img/lightning.svg" alt="Rapide" width={32} height={32} />
                ) : (
                  <div className="text-4xl">⚡</div>
                )}
              </div>
              <h3 className={styles.featureTitle}>Rapide et Facile</h3>
              <p className={styles.featureDescription}>
                Créez un quiz en quelques minutes et partagez-le instantanément avec votre audience.
              </p>
            </motion.div>
            
            <motion.div 
              className={styles.featureCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className={styles.featureIcon}>
                {isMounted ? (
                  <Image src="/img/interactive.svg" alt="Interactif" width={32} height={32} />
                ) : (
                  <div className="text-4xl">🖥️</div>
                )}
              </div>
              <h3 className={styles.featureTitle}>Totalement Interactif</h3>
              <p className={styles.featureDescription}>
                Engagez votre audience avec des questions à choix multiples, des sondages en temps réel et des classements dynamiques.
              </p>
            </motion.div>
            
            <motion.div 
              className={styles.featureCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className={styles.featureIcon}>
                {isMounted ? (
                  <Image src="/img/analytics.svg" alt="Analytique" width={32} height={32} />
                ) : (
                  <div className="text-4xl">📊</div>
                )}
              </div>
              <h3 className={styles.featureTitle}>Analyses Détaillées</h3>
              <p className={styles.featureDescription}>
                Obtenez des statistiques précises sur les performances et l'engagement de vos participants.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Comment ça marche */}
      <section className={styles.howItWorksSection}>
        <div className={styles.container}>
          <div className={styles.sectionTitle}>
            <h2>Comment ça marche ?</h2>
            <div className={styles.separator}></div>
          </div>
          
          <div className={styles.stepsGrid}>
            {[
              {
                number: 1,
                title: "Inscrivez-vous",
                description: "Créez un compte gratuit en quelques secondes."
              },
              {
                number: 2,
                title: "Créez votre Quiz",
                description: "Ajoutez des questions, des réponses et personnalisez votre quiz."
              },
              {
                number: 3,
                title: "Partagez-le",
                description: "Invitez les participants avec un code ou un lien."
              },
              {
                number: 4,
                title: "Jouez en Direct",
                description: "Animez la session et visualisez les résultats en temps réel."
              }
            ].map((step, index) => (
              <motion.div 
                key={index} 
                className={styles.stepCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
              >
                <div className={styles.stepNumber}>
                  {step.number}
                </div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Rejoindre un Quiz */}
      <section className={styles.joinQuizSection}>
        <div className={styles.container}>
          <div className={styles.sectionTitle}>
            <h2>Rejoindre un Quiz</h2>
            <div className={styles.separator}></div>
          </div>
          
          <motion.div 
            className={styles.joinQuizForm}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <form onSubmit={handleJoinQuiz} className="flex flex-col sm:flex-row gap-4 justify-center">
              <input
                type="text"
                value={quizCode}
                onChange={(e) => setQuizCode(e.target.value)}
                placeholder="Entrez le code du quiz"
                className={styles.joinQuizInput}
                required
              />
              <button
                type="submit"
                className={styles.joinQuizButton}
              >
                Rejoindre
              </button>
            </form>
            
            <p className="text-sm text-muted-foreground mt-3 text-center">
              Scannez un QR code ou entrez le code à 6 chiffres
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Quiz Populaires */}
      <section className={styles.quizCardsSection}>
        <div className={styles.container}>
          <div className={styles.quizCardsHeader}>
            <h2 className={styles.sectionTitle}>Quiz Populaires</h2>
            <Link href="/quiz/featured" className={styles.viewAllLink}>
              Voir tous →
            </Link>
          </div>
          
          <div className={styles.quizGrid}>
            {showLoading ? (
              // Placeholders pendant le chargement
              Array(3).fill(0).map((_, index) => (
                <div key={index} className={styles.loadingCard}>
                  <div className={`${styles.loadingLine} ${styles.loadingLineShort}`}></div>
                  <div className={`${styles.loadingLine} ${styles.loadingLineMedium}`}></div>
                  <div className={styles.loadingLineFooter}>
                    <div className={styles.loadingLineFooterItem}></div>
                    <div className={styles.loadingLineFooterItem}></div>
                  </div>
                </div>
              ))
            ) : (
              // Affichage des quiz populaires
              displayedQuizzes.map((quiz, index) => (
                <motion.div
                  key={quiz.id || index}
                  className={styles.quizCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * (index % 3) }}
                >
                  <h3 className={styles.quizCardTitle}>
                    {quiz.title}
                  </h3>
                  <p className={styles.quizCardCategory}>
                    {quiz.category || 'Catégorie non spécifiée'}
                  </p>
                  <div className={styles.quizCardFooter}>
                    <span className={styles.quizCardQuestionCount}>
                      {quiz.questions_count || 0} Questions
                    </span>
                    <button
                      onClick={() => router.push(`/quiz/${quiz.id}`)}
                      className={styles.quizStartButton}
                    >
                      Démarrer
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <motion.h2 
            className={styles.ctaTitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Prêt à créer votre premier quiz ?
          </motion.h2>
          <motion.p 
            className={styles.ctaDescription}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Rejoignez des milliers d'utilisateurs qui dynamisent leurs présentations et cours avec nos quiz interactifs.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link 
              href="/auth/register" 
              className={styles.ctaButton}
            >
              S'inscrire Gratuitement
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Pied de page */}
      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerContent}`}>
          <div className={styles.footerLogo}>
            <Image
              src="/img/logo4.png"
              alt="RTFM2Win Logo"
              width={30}
              height={30}
              className="mr-2"
            />
            <span className="text-sm">
              RTFM2Win © {new Date().getFullYear()}
            </span>
          </div>
          
          <div className={styles.footerLinks}>
            <Link href="/about" className={styles.footerLink}>À propos</Link>
            <Link href="/contact" className={styles.footerLink}>Contact</Link>
            <Link href="/privacy" className={styles.footerLink}>Confidentialité</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

