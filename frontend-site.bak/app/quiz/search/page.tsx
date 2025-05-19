'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
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

const categories = [
  'Tous',
  'Éducation',
  'Science',
  'Technologie',
  'Histoire',
  'Géographie',
  'Musique',
  'Cinéma',
  'Jeux vidéo',
  'Sport',
  'Cuisine',
  'Autres'
];

export default function SearchQuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'Tous');
  
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setIsLoading(true);
        
        // Construire les paramètres de recherche
        const params = new URLSearchParams();
        if (searchTerm) params.append('q', searchTerm);
        if (selectedCategory && selectedCategory !== 'Tous') params.append('category', selectedCategory);
        
        const response = await apiService.searchQuizzes(params.toString());
        setQuizzes(response);
      } catch (err: any) {
        setError(err.message || 'Erreur lors de la recherche de quiz');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuizzes();
  }, [searchTerm, selectedCategory]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mettre à jour l'URL avec les paramètres de recherche
    const params = new URLSearchParams();
    if (searchTerm) params.append('q', searchTerm);
    if (selectedCategory && selectedCategory !== 'Tous') params.append('category', selectedCategory);
    
    router.push(`/quiz/search?${params.toString()}`);
  };
  
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
            <h1 className="text-3xl font-bold text-white mb-2">Rechercher des quiz</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Explorez notre bibliothèque de quiz ou utilisez les filtres pour trouver exactement ce que vous cherchez.
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 mb-10 relative">
            <ShineBorder borderWidth={1} duration={14} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
            
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-300 mb-2">
                    Rechercher
                  </label>
                  <input
                    type="text"
                    id="searchTerm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Entrez des mots-clés..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                    Catégorie
                  </label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category} className="bg-[#1D2233] text-white">
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <motion.button
                  type="submit"
                  className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/25 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Rechercher
                </motion.button>
              </div>
            </form>
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array(6).fill(0).map((_, index) => (
                <div 
                  key={index}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 h-52 animate-pulse border border-white/10"
                >
                  <div className="h-5 bg-white/10 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-white/10 rounded w-1/2 mb-6"></div>
                  <div className="h-20 bg-white/10 rounded mb-4"></div>
                  <div className="h-4 bg-white/10 rounded w-1/4"></div>
                </div>
              ))
            ) : quizzes.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-white mb-2">Aucun quiz trouvé</h3>
                <p className="text-gray-400 max-w-lg mx-auto">
                  Nous n'avons pas trouvé de quiz correspondant à vos critères de recherche. Essayez de modifier vos filtres ou créez votre propre quiz !
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
              quizzes.map((quiz) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-indigo-500/10"
                >
                  <Link href={`/quiz/${quiz.id}`}>
                    <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{quiz.title}</h3>
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 text-xs rounded-full bg-indigo-500/20 text-indigo-300">
                        {quiz.category}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">{quiz.description}</p>
                    <p className="text-gray-500 text-xs">
                      Créé le {new Date(quiz.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 