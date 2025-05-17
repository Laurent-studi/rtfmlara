'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Particles } from '@/components/magicui/particles';
import { ShineBorder } from '@/components/magicui/shine-border';
import { apiService } from '@/lib/api-service';

interface Quiz {
  id: number;
  title: string;
  description: string;
  category: string;
  creatorId: number;
  createdAt: string;
  status: string;
}

interface CategoryWithQuizzes {
  name: string;
  quizzes: Quiz[];
  color: string;
  icon: string;
}

// Couleurs et icônes pour les catégories
const categoryStyles: Record<string, { color: string, icon: string }> = {
  'Éducation': { 
    color: 'from-blue-500 to-blue-600', 
    icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222' 
  },
  'Science': { 
    color: 'from-green-500 to-green-600', 
    icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' 
  },
  'Technologie': { 
    color: 'from-indigo-500 to-indigo-600', 
    icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' 
  },
  'Histoire': { 
    color: 'from-amber-500 to-amber-600', 
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' 
  },
  'Géographie': { 
    color: 'from-emerald-500 to-emerald-600', 
    icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' 
  },
  'Musique': { 
    color: 'from-red-500 to-red-600', 
    icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' 
  },
  'Cinéma': { 
    color: 'from-purple-500 to-purple-600', 
    icon: 'M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z' 
  },
  'Jeux vidéo': { 
    color: 'from-rose-500 to-rose-600', 
    icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z' 
  },
  'Sport': { 
    color: 'from-blue-600 to-blue-700', 
    icon: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z' 
  },
  'Cuisine': { 
    color: 'from-yellow-500 to-yellow-600', 
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' 
  },
  'Autres': { 
    color: 'from-gray-500 to-gray-600', 
    icon: 'M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z' 
  }
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithQuizzes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        
        // Récupérer les catégories
        const categoriesData = await apiService.getQuizCategories();
        
        // Pour chaque catégorie, récupérer ses quiz
        const categoriesWithQuizzes = await Promise.all(
          categoriesData.map(async (category: string) => {
            // Rechercher les quiz de cette catégorie
            const params = new URLSearchParams();
            params.append('category', category);
            const quizzes = await apiService.searchQuizzes(params.toString());
            
            // Attribuer couleur et icône par défaut si la catégorie n'est pas dans notre liste prédéfinie
            const style = categoryStyles[category] || categoryStyles['Autres'];
            
            return {
              name: category,
              quizzes,
              color: style.color,
              icon: style.icon
            };
          })
        );
        
        setCategories(categoriesWithQuizzes);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des catégories');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  return (
    <div className="min-h-screen bg-[#0D111E] relative overflow-hidden">
      <Particles className="absolute inset-0" />
      <Particles className="absolute inset-0" quantity={30} color="#4f46e5" size={0.8} />
      <Particles className="absolute inset-0" quantity={20} color="#7c3aed" size={1.2} />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <Link href="/dashboard">
              <div className="flex items-center gap-4">
                <Image
                  src="/img/logo6.png"
                  alt="RTFM2Win Logo"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <span className="text-white">Retour au tableau de bord</span>
              </div>
            </Link>
          </div>
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">Catégories de quiz</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Explorez notre collection de quiz par catégorie et trouvez exactement ce qui vous intéresse.
            </p>
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-red-400 text-sm">
              {error}
            </div>
          )}
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Array(6).fill(0).map((_, index) => (
                <div 
                  key={index}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 animate-pulse border border-white/10"
                >
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-lg bg-white/10 mr-4"></div>
                    <div className="h-6 bg-white/10 rounded w-1/3"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Array(4).fill(0).map((_, i) => (
                      <div key={i} className="h-16 bg-white/10 rounded-lg"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">Aucune catégorie trouvée</h3>
              <p className="text-gray-400 max-w-lg mx-auto">
                Nous n'avons pas trouvé de catégories avec des quiz. Créez votre premier quiz pour commencer !
              </p>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6"
              >
                <Link 
                  href="/quiz/create"
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/25 transition-all duration-200"
                >
                  Créer un quiz
                </Link>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-12">
              {categories.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
                >
                  <div className="flex items-center mb-6">
                    <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center text-white mr-4`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={category.icon} />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white">{category.name}</h2>
                    <div className="ml-auto">
                      <Link 
                        href={`/quiz/search?category=${encodeURIComponent(category.name)}`}
                        className="text-indigo-400 hover:text-indigo-300 text-sm"
                      >
                        Voir tous les quiz
                      </Link>
                    </div>
                  </div>
                  
                  {category.quizzes.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-400">Aucun quiz dans cette catégorie pour le moment.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.quizzes.slice(0, 6).map((quiz) => (
                        <motion.div
                          key={quiz.id}
                          whileHover={{ y: -5 }}
                          className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-indigo-500/10"
                        >
                          <Link href={`/quiz/${quiz.id}`}>
                            <h3 className="text-white font-semibold mb-2 line-clamp-1">{quiz.title}</h3>
                            <p className="text-gray-400 text-sm line-clamp-2 mb-2">{quiz.description}</p>
                            <p className="text-gray-500 text-xs">
                              Créé le {new Date(quiz.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                          </Link>
                        </motion.div>
                      ))}
                      
                      {category.quizzes.length > 6 && (
                        <motion.div
                          whileHover={{ y: -5 }}
                          className="bg-indigo-500/10 backdrop-blur-sm rounded-xl p-4 border border-indigo-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 flex items-center justify-center"
                        >
                          <Link 
                            href={`/quiz/search?category=${encodeURIComponent(category.name)}`}
                            className="text-indigo-300 hover:text-indigo-200 text-center"
                          >
                            <span className="block mb-1">Voir les {category.quizzes.length - 6} autres quiz</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </Link>
                        </motion.div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 