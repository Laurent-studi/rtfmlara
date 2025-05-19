 'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateQuizForm from '@/components/Quiz/CreateQuizForm';
import QuestionManager from '@/components/Quiz/QuestionManager';

export default function CreateQuizPage() {
  const router = useRouter();
  const [createdQuiz, setCreatedQuiz] = useState<any>(null);
  
  // Gérer le succès de la création du quiz
  const handleQuizCreated = (quiz: any) => {
    setCreatedQuiz(quiz);
  };
  
  // Gérer la finalisation du quiz
  const handleFinishQuiz = () => {
    router.push('/quiz/history');
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {!createdQuiz ? (
        // Formulaire de création de quiz
        <CreateQuizForm onSuccess={handleQuizCreated} />
      ) : (
        // Gestionnaire de questions (uniquement pour les quiz manuels)
        <QuestionManager quiz={createdQuiz} onFinish={handleFinishQuiz} />
      )}
    </div>
  );
}