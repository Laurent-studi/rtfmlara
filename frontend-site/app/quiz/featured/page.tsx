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
  plays?: number;
  rating?: number;
}

export default function FeaturedQuizzesPage() {
  const [featuredQuizzes, setFeaturedQuizzes] = useState<Quiz[]>([]);
  const [trendingQuizzes, setTrendingQuizzes] = useState<Quiz[]>([]);
  const [recommendedQuizzes, setRecommendedQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setIsLoading(true);
        
        // Récupérer les quiz mis en avant
        const featured = await apiService.getFeaturedQuizzes();
        setFeaturedQuizzes(featured);
        
        // Récupérer les quiz tendance
        const trending = await apiService.getTrendingQuizzes();
        setTrendingQuizzes(trending);
        
        // Récupérer les quiz recommandés
        const recommended = await apiService.getRecommendedQuizzes();
        setRecommendedQuizzes(recommended);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des quiz');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuizzes();
  }, []);
  
  // Fonction pour afficher un ensemble de quiz
  const renderQuizzes = (quizzes: Quiz[], emptyMessage: string) => {
    if (quizzes.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-400">{emptyMessage}</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz, index) => (
          <motion.div
            key={quiz.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-indigo-500/10"
          >
            <Link href={`/quiz/${quiz.id}`}>
              <div className="flex justify-between items-start mb-3">
                <span className="px-3 py-1 text-xs rounded-full bg-indigo-500/20 text-indigo-300">
                  {quiz.category}
                </span>
                {quiz.rating && (
                  <div className="flex items-center text-yellow-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs">{quiz.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{quiz.title}</h3>
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">{quiz.description}</p>
              <div className="flex justify-between items-center">
                <p className="text-gray-500 text-xs">
                  Créé le {new Date(quiz.createdAt).toLocaleDateString('fr-FR')}
                </p>
                {quiz.plays !== undefined && (
                  <p className="text-indigo-400 text-xs flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {quiz.plays} participations
                  </p>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    );
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
          
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-white mb-2">Quiz à découvrir</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Explorez notre sélection de quiz exceptionnels, populaires et adaptés à vos intérêts.
            </p>
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-red-400 text-sm">
              {error}
            </div>
          )}
          
          {isLoading ? (
            <div className="space-y-16">
              {[1, 2, 3].map((section) => (
                <div key={section}>
                  <div className="h-8 bg-white/10 rounded w-1/4 mb-6"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array(3).fill(0).map((_, index) => (
                      <div 
                        key={index}
                        className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 h-52 animate-pulse border border-white/10"
                      >
                        <div className="h-5 bg-white/10 rounded w-3/4 mb-3"></div>
                        <div className="h-4 bg-white/10 rounded w-1/2 mb-6"></div>
                        <div className="h-20 bg-white/10 rounded mb-4"></div>
                        <div className="h-4 bg-white/10 rounded w-1/4"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-16">
              {/* Quiz mis en avant */}
              <section>
                <div className="flex items-center mb-6">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Quiz à ne pas manquer</h2>
                </div>
                {renderQuizzes(featuredQuizzes, "Aucun quiz mis en avant pour le moment.")}
              </section>
              
              {/* Quiz tendance */}
              <section>
                <div className="flex items-center mb-6">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Quiz tendance</h2>
                </div>
                {renderQuizzes(trendingQuizzes, "Aucun quiz tendance pour le moment.")}
              </section>
              
              {/* Quiz recommandés */}
              <section>
                <div className="flex items-center mb-6">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Recommandés pour vous</h2>
                </div>
                {renderQuizzes(recommendedQuizzes, "Participez à quelques quiz pour obtenir des recommandations personnalisées.")}
              </section>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 