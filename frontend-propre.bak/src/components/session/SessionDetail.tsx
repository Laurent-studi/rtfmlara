'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiService, QuizSession, Participant, Question, Answer } from '../../../lib/api';

interface SessionDetailProps {
  sessionId: number;
}

export default function SessionDetail({ sessionId }: SessionDetailProps) {
  const router = useRouter();
  const [session, setSession] = useState<QuizSession | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pseudo, setPseudo] = useState('');
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const sessionData = await apiService.getQuizSession(sessionId);
        setSession(sessionData);
        
        // Dans une véritable implémentation, récupérer les participants
        // const participantsData = await apiService.getSessionParticipants(sessionId);
        // setParticipants(participantsData);
        
        // Récupérer les questions du quiz associé
        if (sessionData.quizId) {
          const questionsData = await apiService.getQuizQuestions(sessionData.quizId);
          setQuestions(questionsData);
          
          if (questionsData.length > 0) {
            setCurrentQuestion(questionsData[0]);
            const answersData = await apiService.getQuestionAnswers(questionsData[0].id);
            setAnswers(answersData);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement de la session');
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId]);

  useEffect(() => {
    if (session?.status === 'active' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && currentQuestion) {
      handleSubmitAnswer();
    }
  }, [timeLeft, session]);

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pseudo.trim()) {
      setError('Veuillez entrer un pseudo');
      return;
    }
    
    try {
      const participant = await apiService.joinQuizSession(sessionId, { pseudo });
      setCurrentParticipant(participant);
      setJoinModalOpen(false);
      
      // Mise à jour de la liste des participants
      setParticipants([...participants, participant]);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion à la session');
    }
  };

  const handleStartSession = async () => {
    try {
      const updatedSession = await apiService.startQuizSession(sessionId);
      setSession(updatedSession);
      setTimeLeft(currentQuestion?.points || 30);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du démarrage de la session');
    }
  };

  const handleAnswerSelect = (answerId: number) => {
    if (session?.status !== 'active' || !currentParticipant) return;
    
    if (session.multipleAnswers) {
      // Si réponses multiples autorisées
      if (selectedAnswers.includes(answerId)) {
        setSelectedAnswers(selectedAnswers.filter(id => id !== answerId));
      } else {
        setSelectedAnswers([...selectedAnswers, answerId]);
      }
    } else {
      // Si une seule réponse autorisée
      setSelectedAnswers([answerId]);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentParticipant || !currentQuestion || selectedAnswers.length === 0) return;
    
    try {
      // Soumettre les réponses sélectionnées
      // Dans une vraie implémentation, il faudrait traiter chaque réponse
      for (const answerId of selectedAnswers) {
        // await apiService.submitAnswer({
        //   participantId: currentParticipant.id,
        //   questionId: currentQuestion.id,
        //   answerId,
        //   responseTime: currentQuestion.points - timeLeft
        // });
      }
      
      // Passer à la question suivante
      if (questionIndex < questions.length - 1) {
        setQuestionIndex(questionIndex + 1);
        const nextQuestion = questions[questionIndex + 1];
        setCurrentQuestion(nextQuestion);
        
        const answersData = await apiService.getQuestionAnswers(nextQuestion.id);
        setAnswers(answersData);
        
        setSelectedAnswers([]);
        setTimeLeft(nextQuestion.points || 30);
      } else {
        // Fin du quiz
        setCurrentQuestion(null);
        // Dans une vraie implémentation, marquer la session comme terminée
        // const updatedSession = await apiService.endQuizSession(sessionId);
        // setSession(updatedSession);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la soumission de la réponse');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 max-w-3xl mx-auto mt-8">
        <p>{error || 'Session non trouvée'}</p>
        <Link href="/sessions" className="text-indigo-400 hover:underline block mt-4">
          Retour à la liste des sessions
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-200">Session #{session.id}</h1>
        <div className="flex space-x-4">
          {!currentParticipant && session.status === 'pending' && (
            <button
              onClick={() => setJoinModalOpen(true)}
              className="btn-primary"
            >
              Rejoindre
            </button>
          )}
          
          {session.status === 'pending' && (
            <button
              onClick={handleStartSession}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Démarrer la session
            </button>
          )}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className={`px-3 py-1 text-sm rounded-full ${
              session.status === 'active' 
                ? 'bg-green-500/20 text-green-400' 
                : session.status === 'completed'
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-gray-500/20 text-gray-400'
            } inline-block mb-2`}>
              {session.status === 'active' 
                ? 'Session en cours' 
                : session.status === 'completed'
                ? 'Session terminée'
                : 'Session en attente'}
            </span>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-sm">Démarré le {new Date(session.startedAt).toLocaleString()}</p>
            {session.endedAt && (
              <p className="text-gray-500 text-sm">Terminé le {new Date(session.endedAt).toLocaleString()}</p>
            )}
          </div>
        </div>
      </div>

      {session.status === 'active' && currentQuestion && (
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Question {questionIndex + 1}/{questions.length}</h2>
            <div className="bg-indigo-500/20 px-3 py-1 rounded-full text-indigo-400">
              Temps restant: {timeLeft}s
            </div>
          </div>
          
          <p className="text-gray-200 text-lg mb-6">{currentQuestion.questionText}</p>
          
          <div className="space-y-3 mb-6">
            {answers.map(answer => (
              <button
                key={answer.id}
                onClick={() => handleAnswerSelect(answer.id)}
                className={`w-full text-left p-4 rounded-lg border ${
                  selectedAnswers.includes(answer.id)
                    ? 'bg-indigo-500/20 border-indigo-500 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                } transition-colors`}
              >
                {answer.answerText}
              </button>
            ))}
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswers.length === 0}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Valider ma réponse
            </button>
          </div>
        </div>
      )}

      {/* Affichage des participants */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Participants ({participants.length})</h2>
        
        {participants.length === 0 ? (
          <p className="text-gray-400">Aucun participant pour le moment</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {participants.map(participant => (
              <div key={participant.id} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <p className="text-white font-medium">{participant.pseudo}</p>
                  <p className="text-indigo-400">{participant.score} pts</p>
                </div>
                <p className="text-gray-400 text-sm">Rejoint à {new Date(participant.joinedAt).toLocaleTimeString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal pour rejoindre la session */}
      {joinModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Rejoindre la session</h3>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4 text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleJoinSession}>
              <div className="mb-4">
                <label htmlFor="pseudo" className="form-label">Pseudo</label>
                <input
                  type="text"
                  id="pseudo"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setJoinModalOpen(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Rejoindre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
