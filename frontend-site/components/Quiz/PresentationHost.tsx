'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShineBorder } from '@/components/magicui/shine-border';
import WaitingRoom from './WaitingRoom';
import ThreeDLeaderboard from './ThreeDLeaderboard';

type PresentationState = 'loading' | 'waiting' | 'question' | 'leaderboard' | 'ended';

interface PresentationHostProps {
  sessionId: string;
}

export default function PresentationHost({ sessionId }: PresentationHostProps) {
  const router = useRouter();
  const [state, setState] = useState<PresentationState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [participants, setParticipants] = useState<number>(0);
  const [participantsList, setParticipantsList] = useState<any[]>([]);
  const [questionIndex, setQuestionIndex] = useState<number>(1);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [showAnswers, setShowAnswers] = useState<boolean>(false);
  const [isLastQuestion, setIsLastQuestion] = useState<boolean>(false);

  // Fonction pour récupérer l'état actuel de la session
  const fetchSessionState = useCallback(async () => {
    try {
      const response = await api.get(`presentation/sessions/${sessionId}`);
      
      if (response.success && response.data) {
        setSession(response.data.session);
        setParticipants(response.data.participants_count || 0);
        
        // Récupérer la liste des participants pour la salle d'attente
        if (response.data.leaderboard) {
          setLeaderboard(response.data.leaderboard);
          
          // Transformer le leaderboard en liste de participants pour WaitingRoom
          const players = response.data.leaderboard.map((entry: any) => ({
            id: entry.participant_id.toString(),
            name: entry.name,
            isHost: entry.user_id === response.data.session.presenter_id
          }));
          setParticipantsList(players);
        }
        
        if (response.data.session.status === 'pending') {
          setState('waiting');
        } else if (response.data.session.status === 'active') {
          if (response.data.current_question) {
            setCurrentQuestion(response.data.current_question);
            setQuestionIndex(response.data.session.question_index);
            setTotalQuestions(response.data.session.total_questions);
            setState('question');
            
            // Initialiser le timer si c'est une nouvelle question
            if (!timerActive) {
              const secondsPerQuestion = session?.quiz?.time_per_question || 30;
              setTimeLeft(secondsPerQuestion);
              setTimerActive(true);
            }
          } else {
            setState('leaderboard');
          }
        } else if (response.data.session.status === 'completed') {
          setState('ended');
        }
      } else {
        setError(response.message || 'Erreur lors du chargement de la session');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement de la session');
    }
  }, [sessionId, timerActive, session]);

  // Effet pour récupérer l'état initial
  useEffect(() => {
    fetchSessionState();
    
    // Établir une actualisation régulière
    const interval = setInterval(() => {
      fetchSessionState();
    }, 5000); // Toutes les 5 secondes
    
    return () => clearInterval(interval);
  }, [fetchSessionState]);

  // Timer pour les questions
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (timerActive && timeLeft > 0 && state === 'question') {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timerActive && timeLeft === 0 && state === 'question') {
      // Temps écoulé, montrer les réponses
      setTimerActive(false);
      setShowAnswers(true);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timerActive, timeLeft, state]);

  // Démarrer la session
  const startSession = async () => {
    try {
      setError(null);
      const response = await api.post(`presentation/sessions/${sessionId}/start`, {});
      
      if (response.success) {
        setCurrentQuestion(response.data.current_question);
        setQuestionIndex(response.data.question_index);
        setTotalQuestions(response.data.total_questions);
        setState('question');
        
        // Initialiser le timer
        const secondsPerQuestion = session?.quiz?.time_per_question || 30;
        setTimeLeft(secondsPerQuestion);
        setTimerActive(true);
      } else {
        setError(response.message || 'Erreur lors du démarrage de la session');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du démarrage de la session');
    }
  };

  // Passer à la question suivante
  const nextQuestion = async () => {
    try {
      setError(null);
      setShowAnswers(false);
      
      // Vérifier si on montre d'abord le leaderboard
      const showLeaderboardBetween = session?.session_settings?.show_leaderboard_between;
      
      if (showLeaderboardBetween && state === 'question') {
        // Récupérer le classement actuel
        const response = await api.get(`presentation/sessions/${sessionId}/leaderboard`);
        
        if (response.success) {
          setLeaderboard(response.data.leaderboard);
          setState('leaderboard');
          return;
        }
      }
      
      // Sinon, passer directement à la question suivante
      const response = await api.post(`presentation/sessions/${sessionId}/next`, {});
      
      if (response.success) {
        if (response.data.is_completed) {
          setState('ended');
        } else {
          setCurrentQuestion(response.data.current_question);
          setQuestionIndex(response.data.question_index);
          setIsLastQuestion(response.data.is_last_question || false);
          setState('question');
          
          // Réinitialiser le timer
          const secondsPerQuestion = session?.quiz?.time_per_question || 30;
          setTimeLeft(secondsPerQuestion);
          setTimerActive(true);
        }
      } else {
        setError(response.message || 'Erreur lors du passage à la question suivante');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du passage à la question suivante');
    }
  };

  // Terminer la session
  const endSession = async () => {
    try {
      setError(null);
      const response = await api.post(`presentation/sessions/${sessionId}/end`, {});
      
      if (response.success) {
        setState('ended');
        setLeaderboard(response.data.leaderboard);
      } else {
        setError(response.message || 'Erreur lors de la fin de la session');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la fin de la session');
    }
  };

  // Retourner à la liste des quiz
  const backToQuizzes = () => {
    router.push('/quiz/search');
  };

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 text-white p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Erreur</h2>
        <p className="mb-6">{error}</p>
        <button
          onClick={backToQuizzes}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none transition-all"
        >
          Retour aux quiz
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-[80vh]">
      <AnimatePresence mode="wait">
        {state === 'loading' && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center min-h-[80vh]"
          >
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
          </motion.div>
        )}

        {state === 'waiting' && session && (
          <motion.div 
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <WaitingRoom 
              players={participantsList}
              quizUrl={`${window.location.origin}/quiz/join/${session.join_code}`}
              quizCode={session.join_code}
              isHost={true}
              onStartQuiz={startSession}
            />
          </motion.div>
        )}

        {state === 'question' && currentQuestion && (
          <motion.div 
            key="question"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-5xl mx-auto"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 relative overflow-hidden">
              <ShineBorder borderWidth={1} duration={14} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
              
              <div className="flex justify-between items-center mb-6">
                <div className="bg-indigo-900/50 px-3 py-1 rounded-lg">
                  <span className="text-white font-medium">
                    Question {questionIndex}/{totalQuestions}
                  </span>
                </div>
                
                <div className="bg-indigo-900/50 px-3 py-1 rounded-lg">
                  <span className="text-white font-medium">
                    {participants} participant{participants > 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className={`px-4 py-2 rounded-lg font-bold ${
                  timeLeft > 10 ? 'bg-green-500/20 text-green-300' : 
                  timeLeft > 5 ? 'bg-yellow-500/20 text-yellow-300' : 
                  'bg-red-500/20 text-red-300'
                }`}>
                  {timeLeft}s
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-8 text-center">
                {currentQuestion.text}
              </h2>
              
              {currentQuestion.multiple_answers && (
                <div className="mb-6 text-center">
                  <span className="inline-block bg-purple-900/50 text-purple-300 px-4 py-1 rounded-full text-sm">
                    Question à choix multiples
                  </span>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {currentQuestion.answers && currentQuestion.answers.map((answer: any, index: number) => (
                  <div 
                    key={answer.id} 
                    className={`p-4 rounded-xl border transition-all ${
                      showAnswers
                        ? answer.is_correct
                          ? 'bg-green-500/20 border-green-500/50 text-white'
                          : 'bg-red-500/20 border-red-500/50 text-white'
                        : 'bg-white/10 border-white/20 text-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                        showAnswers
                          ? answer.is_correct
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                          : 'bg-white/20 text-white'
                      }`}>
                        {['A', 'B', 'C', 'D'][index]}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{answer.answer_text}</p>
                        
                        {showAnswers && answer.explanation && (
                          <div className="mt-2 text-sm opacity-80">
                            {answer.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={showAnswers ? nextQuestion : () => {
                    setTimerActive(false);
                    setShowAnswers(true);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all"
                >
                  {showAnswers 
                    ? isLastQuestion
                      ? "Terminer le quiz"
                      : "Question suivante"
                    : "Afficher les réponses"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {state === 'leaderboard' && (
          <motion.div 
            key="leaderboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 relative overflow-hidden">
              <ShineBorder borderWidth={1} duration={14} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
              
              <h1 className="text-4xl font-bold text-center text-white mb-8">
                Classement actuel
              </h1>
              
              <div className="mb-8">  
                {leaderboard.length > 0 ? (  
                  <ThreeDLeaderboard 
                    participants={leaderboard}
                    title=""
                    animate={true}
                  />
                ) : (
                  <div className="text-center text-gray-300">
                    Aucun participant n'a encore marqué de points
                  </div>
                )}
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={nextQuestion}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all"
                >
                  Question suivante
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {state === 'ended' && (
          <motion.div 
            key="ended"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 relative overflow-hidden">
              <ShineBorder borderWidth={1} duration={14} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
              
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">
                  Quiz terminé !
                </h1>
                <p className="text-gray-300 text-xl">
                  Merci d'avoir participé à ce quiz
                </p>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Podium final
              </h2>
              
              {leaderboard.length > 0 ? (                <div className="mb-12">                  <ThreeDLeaderboard                     participants={leaderboard}                    title=""                    showReflection={true}                    animate={true}                  />                </div>              ) : (
                <div className="text-center text-gray-300 mb-8">
                  Aucun participant n'a marqué de points
                </div>
              )}
              
              <div className="flex justify-center">
                <button
                  onClick={backToQuizzes}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all"
                >
                  Retour aux quiz
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}