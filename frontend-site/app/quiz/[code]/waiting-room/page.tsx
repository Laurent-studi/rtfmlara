'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Particles } from '@/components/magicui/particles';
import { ShineBorder } from '@/components/magicui/shine-border';
import { QRCodeSVG } from 'qrcode.react';

export default function WaitingRoomPage({ params }: { params: { code: string } }) {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState<{ id: string; name: string; isHost: boolean }[]>([]);
  const [quizUrl, setQuizUrl] = useState('');
  
  // Simuler la récupération des joueurs (à remplacer par une API réelle)
  useEffect(() => {
    // Générer l'URL du quiz
    const url = `${window.location.origin}/quiz/${params.code}`;
    setQuizUrl(url);
    
    // Simuler des joueurs existants
    setPlayers([
      { id: '1', name: 'Présentateur', isHost: true },
      { id: '2', name: 'Alice', isHost: false },
      { id: '3', name: 'Bob', isHost: false },
    ]);
  }, [params.code]);
  
  const handleJoinQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    
    // Ajouter le joueur à la liste (à remplacer par une API réelle)
    const newPlayer = {
      id: Math.random().toString(36).substring(2, 9),
      name: playerName,
      isHost: false,
    };
    
    setPlayers(prev => [...prev, newPlayer]);
    setIsJoining(false);
    
    // Rediriger vers la page du quiz après un court délai
    setTimeout(() => {
      router.push(`/quiz/${params.code}/play?player=${encodeURIComponent(playerName)}`);
    }, 1500);
  };
  
  const handleStartAsHost = () => {
    setIsHost(true);
    setIsJoining(false);
    
    // Rediriger vers la page du présentateur
    setTimeout(() => {
      router.push(`/quiz/${params.code}/host`);
    }, 1500);
  };
  
  return (
    <div className="min-h-screen bg-[#0D111E] relative overflow-hidden">
      <Particles className="absolute inset-0" />
      <Particles className="absolute inset-0" quantity={30} color="#4f46e5" size={0.8} />
      <Particles className="absolute inset-0" quantity={20} color="#7c3aed" size={1.2} />
      <Particles className="absolute inset-0" quantity={15} color="#ec4899" size={1.6} />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-4">
            Salle d'attente
          </h1>
          <p className="text-xl text-gray-300">
            Code du quiz: <span className="font-bold text-white">{params.code}</span>
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Formulaire de connexion */}
          {isJoining && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 relative"
            >
              <ShineBorder borderWidth={1} duration={14} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
              <h2 className="text-2xl font-bold text-white mb-6">Rejoindre le quiz</h2>
              
              <form onSubmit={handleJoinQuiz} className="space-y-4">
                <div>
                  <label htmlFor="playerName" className="block text-sm font-medium text-gray-300 mb-2">
                    Votre pseudo
                  </label>
                  <input
                    type="text"
                    id="playerName"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="Entrez votre pseudo"
                    required
                  />
                </div>
                
                <motion.button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/25 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Rejoindre
                </motion.button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-gray-400 mb-2">Vous êtes le créateur du quiz ?</p>
                <motion.button
                  onClick={handleStartAsHost}
                  className="px-6 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Démarrer comme présentateur
                </motion.button>
              </div>
            </motion.div>
          )}
          
          {/* Liste des participants */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 relative"
          >
            <ShineBorder borderWidth={1} duration={14} shineColor={["#7c3aed", "#ec4899", "#4f46e5"]} />
            <h2 className="text-2xl font-bold text-white mb-6">Participants</h2>
            
            <div className="space-y-3 mb-8">
              {players.map((player) => (
                <div
                  key={player.id}
                  className={`flex items-center p-3 rounded-lg ${
                    player.isHost ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-white/5 border border-white/10'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-3">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium">{player.name}</p>
                    {player.isHost && <p className="text-xs text-indigo-300">Présentateur</p>}
                  </div>
                </div>
              ))}
            </div>
            
            {/* QR Code pour rejoindre */}
            <div className="text-center">
              <p className="text-gray-300 mb-4">Scannez pour rejoindre</p>
              <div className="bg-white p-2 rounded-lg inline-block">
                <QRCodeSVG value={quizUrl} size={150} />
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Bouton de retour */}
        <div className="text-center mt-12">
          <motion.button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Retour à l'accueil
          </motion.button>
        </div>
      </div>
    </div>
  );
} 