import { useRouter } from 'next/router';
import QuizForm from '../../../../components/quiz/QuizForm';

export default function EditQuizPage() {
  const router = useRouter();
  const { id } = router.query;
  
  if (!id || typeof id !== 'string') {
    return null;
  }

  return <QuizForm quizId={parseInt(id)} />;
} 