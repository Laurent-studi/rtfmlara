'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Particles } from './../components/magicui/particles';
import { ShineBorder } from '@/components/magicui/shine-border';


function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return size;
}

export default function HomePage() {
  const router = useRouter();
  const [quizCode, setQuizCode] = useState('');
  const { width, height } = useWindowSize();

  const handleJoinQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (quizCode.trim()) {
      router.push(`/quiz/${quizCode}`);
    }
  };

  const handleCreateQuiz = () => {
    const newQuizCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    router.push(`/quiz/${newQuizCode}`);
  };

  return (
    <div className="min-h-screen bg-[#0D111E] relative overflow-hidden">
      {/* Effet de particules animées */}
      <Particles className="absolute inset-0" />
      <Particles className="absolute inset-0" quantity={30} color="#4f46e5" size={0.8} />
      <Particles className="absolute inset-0" quantity={20} color="#7c3aed" size={1.2} />
      <Particles className="absolute inset-0" quantity={15} color="#ec4899" size={1.6} />
      
      <div className="container mx-auto px-4 py-16 relative z-10">      

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <Image
              src="/img/logo6.png"
              alt="RTFM2Win Logo"
              width={80}
              height={80}
              className="rounded-lg"
            />
            <motion.h1 
              className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              RTFM2Win
            </motion.h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Créez et participez à des quiz interactifs en temps réel avec vos amis
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300 relative"
          >
            <ShineBorder borderWidth={1} duration={14} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-indigo-400">→</span> Rejoindre un Quiz
            </h2>
            <form onSubmit={handleJoinQuiz} className="space-y-4">
              <input
                type="text"
                value={quizCode}
                onChange={(e) => setQuizCode(e.target.value)}
                placeholder="Entrez le code du quiz"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                required
              />
              <motion.button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/25 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Rejoindre
              </motion.button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300 relative"
          >
            <ShineBorder borderWidth={1} duration={14} shineColor={["#7c3aed", "#ec4899", "#4f46e5"]} />
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-purple-400">→</span> Créer un Quiz
            </h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Créez votre propre quiz et invitez vos amis à y participer
            </p>
            <motion.button
              onClick={handleCreateQuiz}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Créer un Quiz
            </motion.button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400 mb-8">
            Fonctionnalités
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                title: "Quiz en Temps Réel",
                description: "Répondez aux questions en simultané avec les autres participants",
                icon: "⚡"
              },
              {
                title: "Classement en Direct",
                description: "Suivez votre position dans le classement en temps réel",
                icon: "🏆"
              },
              {
                title: "Partage Facile",
                description: "Invitez vos amis via un simple code ou QR code",
                icon: "🔗"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 relative"
              >
                <ShineBorder borderWidth={1} duration={14} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
