'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Question {
  id?: number;
  quiz_id: number;
  text: string;
  time?: number;
  points?: number;
  multiple_answers?: boolean;
  order_index?: number;
  question_text?: string;
  answers: Answer[];
}

interface Answer {
  id?: number;
  question_id?: number;
  text: string;
  is_correct: boolean;
  answer_text?: string;
  explanation?: string;
}

interface QuestionManagerProps {
  quiz: any;
  onFinish: () => void;
  isEditing?: boolean;
}

export default function QuestionManager({ quiz, onFinish, isEditing = false }: QuestionManagerProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    quiz_id: quiz.id,
    text: '',
    time: quiz.time_per_question || 30,
    points: 1000,
    multiple_answers: false,
    answers: [
      { text: '', is_correct: true },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false }
    ]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await api.get(`quizzes/${quiz.id}/questions`);
        if (response && response.data) {
          setQuestions(response.data);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des questions:', err);
      }
    };

    if (quiz.id) {
      fetchQuestions();
    }
  }, [quiz.id]);

  // Réinitialiser les messages après 5 secondes
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleQuestionTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentQuestion({
      ...currentQuestion,
      text: e.target.value
    });
  };

  const handleAnswerTextChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newAnswers = [...currentQuestion.answers];
    newAnswers[index].text = e.target.value;
    setCurrentQuestion({
      ...currentQuestion,
      answers: newAnswers
    });
  };

  const handleCorrectAnswerChange = (index: number) => {
    const newAnswers = currentQuestion.answers.map((answer, i) => ({
      ...answer,
      is_correct: currentQuestion.multiple_answers ? 
        (i === index ? !answer.is_correct : answer.is_correct) : 
        i === index
    }));
    setCurrentQuestion({
      ...currentQuestion,
      answers: newAnswers
    });
  };

  const handleMultipleAnswersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isMultiple = e.target.checked;
    setCurrentQuestion({
      ...currentQuestion,
      multiple_answers: isMultiple,
      // Si on passe en mode simple, s'assurer qu'une seule réponse est correcte
      answers: isMultiple ? currentQuestion.answers : currentQuestion.answers.map((answer, i) => ({
        ...answer,
        is_correct: i === 0 ? true : false
      }))
    });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentQuestion({
      ...currentQuestion,
      time: parseInt(e.target.value)
    });
  };

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentQuestion({
      ...currentQuestion,
      points: parseInt(e.target.value)
    });
  };

  const handleAddQuestion = async () => {
    setError('');
    setSuccess('');
    
    // Validation
    if (!currentQuestion.text.trim()) {
      setError('Le texte de la question est requis');
      return;
    }

    const validAnswers = currentQuestion.answers.filter(a => a.text.trim());
    if (validAnswers.length < 2) {
      setError('Au moins 2 réponses sont requises');
      return;
    }

    const correctAnswers = validAnswers.filter(a => a.is_correct);
    if (correctAnswers.length === 0) {
      setError('Au moins une réponse doit être correcte');
      return;
    }

    if (!currentQuestion.multiple_answers && correctAnswers.length > 1) {
      setError('Une seule réponse peut être correcte en mode réponse unique');
      return;
    }

    setIsLoading(true);

    try {
      const questionData = {
        quiz_id: parseInt(quiz.id.toString()),
        question_text: currentQuestion.text,
        points: currentQuestion.points || 1000,
        multiple_answers: currentQuestion.multiple_answers || false,
        order_index: questions.length,
        answers: validAnswers.map(answer => ({
          answer_text: answer.text,
          is_correct: answer.is_correct,
          explanation: answer.explanation || null
        }))
      };
      
      console.log('Données envoyées:', questionData);
      
      // Utiliser l'API existante
      const response = await api.post(`quizzes/${quiz.id}/questions`, questionData);
      
      if (!response || !response.data) {
        throw new Error('Données de réponse invalides');
      }

      const newQuestionData = response.data;
      
      // Conversion du format de réponse au format local
      const newQuestion = {
        id: newQuestionData.id,
        quiz_id: newQuestionData.quiz_id,
        text: newQuestionData.question_text,
        question_text: newQuestionData.question_text,
        points: newQuestionData.points,
        multiple_answers: newQuestionData.multiple_answers,
        answers: newQuestionData.answers.map((a: any) => ({
          id: a.id,
          text: a.answer_text,
          answer_text: a.answer_text,
          is_correct: a.is_correct === true || a.is_correct === 1,
          explanation: a.explanation
        }))
      };

      // Mise à jour de l'interface avec la question
      setQuestions([...questions, newQuestion]);

      // Réinitialiser le formulaire
      setCurrentQuestion({
        quiz_id: quiz.id,
        text: '',
        time: quiz.time_per_question || 30,
        points: 1000,
        multiple_answers: false,
        answers: [
          { text: '', is_correct: true },
          { text: '', is_correct: false },
          { text: '', is_correct: false },
          { text: '', is_correct: false }
        ]
      });

      setSuccess('Question ajoutée avec succès!');

    } catch (err: any) {
      let errorMsg = 'Erreur lors de l\'ajout de la question';
      
      console.error('Erreur détaillée:', err);
      
      if (err.data && (err.data.error || err.data.message)) {
        errorMsg = err.data.error || err.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }

      // Solution de secours: ajouter localement si le serveur échoue
      const mockQuestion = {
        id: Date.now(), 
        quiz_id: quiz.id,
        text: currentQuestion.text,
        question_text: currentQuestion.text,
        points: currentQuestion.points || 1000,
        multiple_answers: currentQuestion.multiple_answers || false,
        answers: currentQuestion.answers.filter(a => a.text.trim()).map((answer, index) => ({
          id: Date.now() + index,
          text: answer.text,
          answer_text: answer.text,
          is_correct: answer.is_correct,
          explanation: answer.explanation
        }))
      };

      setQuestions([...questions, mockQuestion]);
      setSuccess('Question ajoutée en mode secours local (le serveur n\'a pas pu traiter la demande).');
      
      console.warn(errorMsg);
      
      // Réinitialiser le formulaire
      setCurrentQuestion({
        quiz_id: quiz.id,
        text: '',
        time: quiz.time_per_question || 30,
        points: 1000,
        multiple_answers: false,
        answers: [
          { text: '', is_correct: true },
          { text: '', is_correct: false },
          { text: '', is_correct: false },
          { text: '', is_correct: false }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    if (questions.length === 0) {
      setError('Veuillez ajouter au moins une question');
      return;
    }
    
    onFinish();
  };

  return (
    <div className="card p-6 mb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Ajouter des questions</h1>
        <p className="text-muted-foreground">
          Quiz: {quiz.title} - Ajoutez des questions et leurs réponses
        </p>
      </div>
      
      {error && (
        <div className="bg-destructive/15 border border-destructive/50 text-destructive p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-500/15 border border-green-500/50 text-green-600 dark:text-green-400 p-4 rounded-lg mb-6">
          {success}
        </div>
      )}

      {/* Questions existantes */}
      {questions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Questions ajoutées</h2>
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id || index} className="card p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold">Q{index + 1}: {question.question_text || question.text}</p>
                  {question.multiple_answers && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                      Réponses multiples
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {question.answers.map((answer, ansIndex) => (
                    <div 
                      key={answer.id || ansIndex} 
                      className={`p-2 rounded border ${
                        answer.is_correct 
                          ? 'border-primary bg-primary/10 text-primary' 
                          : 'border-border bg-muted/50 text-muted-foreground'
                      }`}
                    >
                      {answer.answer_text || answer.text}
                      {answer.is_correct && <span className="ml-2 text-sm">✓</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulaire de nouvelle question */}
      <div className="card p-5 mb-6">
        <h2 className="text-xl font-semibold mb-4">Nouvelle question</h2>
        
        <div className="space-y-5">
          <div>
            <label htmlFor="question-text" className="block font-medium mb-2">
              Question <span className="text-destructive">*</span>
            </label>
            <input
              id="question-text"
              type="text"
              value={currentQuestion.text}
              onChange={handleQuestionTextChange}
              placeholder="Saisissez votre question ici"
              className="input w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="time" className="block font-medium mb-2">
                Temps (secondes)
              </label>
              <input
                id="time"
                type="number"
                value={currentQuestion.time}
                onChange={handleTimeChange}
                min={5}
                max={300}
                className="input w-full"
              />
            </div>
            <div>
              <label htmlFor="points" className="block font-medium mb-2">
                Points
              </label>
              <input
                id="points"
                type="number"
                value={currentQuestion.points}
                onChange={handlePointsChange}
                min={100}
                step={100}
                max={10000}
                className="input w-full"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                id="multiple-answers"
                checked={currentQuestion.multiple_answers}
                onChange={handleMultipleAnswersChange}
                className="checkbox"
              />
              <label htmlFor="multiple-answers" className="font-medium">
                Autoriser plusieurs réponses correctes
              </label>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-2">
              Réponses <span className="text-destructive">*</span>
            </label>
            <div className="space-y-3">
              {currentQuestion.answers.map((answer, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type={currentQuestion.multiple_answers ? "checkbox" : "radio"}
                    id={`correct-${index}`}
                    name={currentQuestion.multiple_answers ? undefined : "correct-answer"}
                    checked={answer.is_correct}
                    onChange={() => handleCorrectAnswerChange(index)}
                    className={currentQuestion.multiple_answers ? "checkbox" : "radio"}
                  />
                  <input
                    type="text"
                    value={answer.text}
                    onChange={(e) => handleAnswerTextChange(index, e)}
                    placeholder={`Réponse ${index + 1}`}
                    className="input flex-1"
                  />
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {currentQuestion.multiple_answers 
                ? "Cochez les cases à côté des réponses correctes" 
                : "Sélectionnez le bouton radio à côté de la réponse correcte"
              }
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-3">
        <button
          onClick={handleAddQuestion}
          disabled={isLoading}
          className="btn btn-primary"
        >
          {isLoading ? 'Ajout en cours...' : 'Ajouter cette question'}
        </button>
        
        <button
          onClick={handleFinish}
          className="btn btn-secondary"
        >
          Terminer et publier le quiz
        </button>
      </div>
    </div>
  );
} 