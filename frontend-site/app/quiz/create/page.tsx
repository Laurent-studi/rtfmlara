'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ShineBorder } from '@/components/magicui/shine-border';
import { Particles } from '@/components/magicui/particles';
import CreateQuiz from '@/components/CreateQuiz';

const CreateQuizPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-violet-900 text-white">
      <div className="relative w-full h-full">
        <Particles
          className="absolute inset-0 pointer-events-none"
          quantity={100}
          staticity={30}
        />
        
        <div className="container mx-auto pt-12 pb-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
              Créer un Nouveau Quiz
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Créez votre propre quiz personnalisé avec plusieurs questions, options et minuteurs. Partagez-le avec vos amis ou la communauté.
            </p>
          </motion.div>
          
          <ShineBorder className="max-w-5xl mx-auto">
            <div className="bg-black/40 backdrop-blur-md p-6 md:p-8 rounded-2xl">
              <CreateQuiz />
            </div>
          </ShineBorder>
        </div>
      </div>
    </div>
  );
};

export default CreateQuizPage; 