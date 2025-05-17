'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Particles } from '@/components/magicui/particles';
import { ShineBorder } from '@/components/magicui/shine-border';
import { apiService } from '@/lib/api-service';

interface Question {
  id: number;
  questionText: string;
  points: number;
  orderIndex: number;
  answers: Answer[];
}

interface Answer {
  id: number;
  answerText: string;
  isCorrect: boolean;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  category: string;
  timePerQuestion: number;
  multipleAnswers: boolean;
  status: string;
}

export default function EditQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = parseInt(params.id as string);
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // État pour le formulaire de nouvelle question
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    points: 10,
    answers: [
      { answerText: '', isCorrect: false },
      { answerText: '', isCorrect: false },
      { answerText: '', isCorrect: false },
      { answerText: '', isCorrect: false }
    ]
  });
  
  // Charger les données du quiz
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const quizData = await apiService.getQuiz(quizId);
        setQuiz(quizData);
        
        const questionsData = await apiService.getQuizQuestions(quizId);
        
        // Pour chaque question, récupérer ses réponses
        const questionsWithAnswers = await Promise.all(
          questionsData.map(async (question) => {
            const answers = await apiService.getQuestionAnswers(question.id);
            return { ...question, answers };
          })
        );
        
        setQuestions(questionsWithAnswers);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement du quiz');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuizData();
  }, [quizId]);
  
  // Gérer le changement dans le formulaire de question
  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewQuestion({
      ...newQuestion,
      [e.target.name]: e.target.value
    });
  };
  
  // Gérer le changement des réponses
  const handleAnswerChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedAnswers = [...newQuestion.answers];
    if (e.target.name === 'isCorrect') {
      updatedAnswers[index] = {
        ...updatedAnswers[index],
        isCorrect: e.target.checked
      };
    } else {
      updatedAnswers[index] = {
        ...updatedAnswers[index],
        answerText: e.target.value
      };
    }
    
    setNewQuestion({
      ...newQuestion,
      answers: updatedAnswers
    });
  };
  
  // Ajouter une nouvelle question
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Vérifier qu'au moins une réponse est correcte
      if (!newQuestion.answers.some(answer => answer.isCorrect)) {
        setError('Vous devez sélectionner au moins une réponse correcte');
        setIsLoading(false);
        return;
      }
      
      // Créer la question
      const createdQuestion = await apiService.createQuestion({
        quizId,
        questionText: newQuestion.questionText,
        points: newQuestion.points,
        orderIndex: questions.length
      });
      
      // Créer les réponses pour cette question
      const answers = await Promise.all(
        newQuestion.answers
          .filter(answer => answer.answerText.trim() !== '')
          .map(answer => 
            apiService.createAnswer({
              questionId: createdQuestion.id,
              answerText: answer.answerText,
              isCorrect: answer.isCorrect
            })
          )
      );
      
      // Ajouter la nouvelle question à la liste
      setQuestions([...questions, { ...createdQuestion, answers }]);
      
      // Réinitialiser le formulaire
      setNewQuestion({
        questionText: '',
        points: 10,
        answers: [
          { answerText: '', isCorrect: false },
          { answerText: '', isCorrect: false },
          { answerText: '', isCorrect: false },
          { answerText: '', isCorrect: false }
        ]
      });
      
      setError('');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'ajout de la question');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Publier le quiz
  const handlePublishQuiz = async () => {
    if (questions.length === 0) {
      setError('Vous devez ajouter au moins une question avant de publier le quiz');
      return;
    }
    
    try {
      setIsLoading(true);
      await apiService.updateQuiz(quizId, { status: 'published' });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la publication du quiz');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Supprimer une question
  const handleDeleteQuestion = async (questionId: number) => {
    try {
      await apiService.deleteQuestion(questionId);
      setQuestions(questions.filter(q => q.id !== questionId));
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression de la question');
    }
  };
  
  if (isLoading && !quiz) {
    return (
      <div className="min-h-screen bg-[#0D111E] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500 border-r-2 border-indigo-500 mb-4"></div>
          <p>Chargement du quiz...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#0D111E] relative overflow-hidden">
      <Particles className="absolute inset-0" />
      <Particles className="absolute inset-0" quantity={30} color="#4f46e5" size={0.8} />
      <Particles className="absolute inset-0" quantity={20} color="#7c3aed" size={1.2} />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
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
            
            <motion.button
              onClick={handlePublishQuiz}
              disabled={isLoading || questions.length === 0}
              className="py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-green-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Publier le quiz
            </motion.button>
          </div>
          
          {quiz && (
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">{quiz.title}</h1>
              <p className="text-gray-400 mb-4">{quiz.description}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full">
                  {quiz.category}
                </span>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full">
                  {quiz.timePerQuestion} secondes par question
                </span>
                <span className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full">
                  {quiz.multipleAnswers ? 'Réponses multiples' : 'Réponse unique'}
                </span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 mb-8 relative">
            <ShineBorder borderWidth={1} duration={14} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
            <h2 className="text-xl font-bold text-white mb-4">Ajouter une question</h2>
            
            <form onSubmit={handleAddQuestion} className="space-y-6">
              <div>
                <label htmlFor="questionText" className="block text-sm font-medium text-gray-300 mb-2">
                  Texte de la question
                </label>
                <textarea
                  id="questionText"
                  name="questionText"
                  value={newQuestion.questionText}
                  onChange={handleQuestionChange}
                  placeholder="Ex: Quelle est la capitale de la France?"
                  rows={2}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="points" className="block text-sm font-medium text-gray-300 mb-2">
                  Points
                </label>
                <input
                  type="number"
                  id="points"
                  name="points"
                  min={1}
                  max={100}
                  value={newQuestion.points}
                  onChange={handleQuestionChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3">Réponses</h3>
                <div className="space-y-4">
                  {newQuestion.answers.map((answer, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={`isCorrect-${index}`}
                        name="isCorrect"
                        checked={answer.isCorrect}
                        onChange={(e) => handleAnswerChange(index, e)}
                        className="h-5 w-5 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                      />
                      <input
                        type="text"
                        name="answerText"
                        value={answer.answerText}
                        onChange={(e) => handleAnswerChange(index, e)}
                        placeholder={`Réponse ${index + 1}`}
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-gray-400 text-xs mt-2">Cochez les réponses correctes</p>
              </div>
              
              <div>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? 'Ajout en cours...' : 'Ajouter la question'}
                </motion.button>
              </div>
            </form>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Questions ({questions.length})</h2>
            
            {questions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">Aucune question n'a encore été ajoutée.</p>
                <p className="text-gray-400 text-sm mt-2">Utilisez le formulaire ci-dessus pour ajouter des questions à votre quiz.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-white font-medium">
                          Question {index + 1}: {question.questionText}
                        </h3>
                        <p className="text-indigo-400 text-sm mt-1">{question.points} points</p>
                      </div>
                      <motion.button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </motion.button>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      {question.answers.map((answer, aIndex) => (
                        <div 
                          key={answer.id} 
                          className={`px-3 py-2 rounded-lg text-sm ${
                            answer.isCorrect 
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                              : 'bg-white/5 text-gray-300 border border-white/10'
                          }`}
                        >
                          {answer.answerText}
                          {answer.isCorrect && (
                            <span className="ml-2 text-xs bg-green-500/30 px-2 py-0.5 rounded-full">
                              Correcte
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 