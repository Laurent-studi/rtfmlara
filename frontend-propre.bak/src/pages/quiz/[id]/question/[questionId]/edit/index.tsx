import { useRouter } from 'next/router';
import QuestionForm from '../../../../../../components/question/QuestionForm';

export default function EditQuestionPage() {
  const router = useRouter();
  const { id, questionId } = router.query;
  
  if (!id || typeof id !== 'string' || !questionId || typeof questionId !== 'string') {
    return null;
  }

  return <QuestionForm quizId={parseInt(id)} questionId={parseInt(questionId)} />;
} 