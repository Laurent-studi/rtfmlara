import { useRouter } from 'next/router';
import QuizDetail from '../../../components/quiz/QuizDetail';

export default function QuizDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  
  if (!id || typeof id !== 'string') {
    return null;
  }

  return <QuizDetail quizId={parseInt(id)} />;
} 