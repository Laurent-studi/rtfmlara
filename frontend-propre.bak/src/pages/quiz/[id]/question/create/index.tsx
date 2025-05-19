import { useRouter } from 'next/router';
import QuestionForm from '../../../../../components/question/QuestionForm';

export default function CreateQuestionPage() {
  const router = useRouter();
  const { id } = router.query;
  
  if (!id || typeof id !== 'string') {
    return null;
  }

  return <QuestionForm quizId={parseInt(id)} />;
} 