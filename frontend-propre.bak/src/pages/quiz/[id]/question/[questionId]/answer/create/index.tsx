import { useRouter } from 'next/router';
import AnswerForm from '../../../../../../../components/answer/AnswerForm';

export default function CreateAnswerPage() {
  const router = useRouter();
  const { id, questionId } = router.query;
  
  if (!id || typeof id !== 'string' || !questionId || typeof questionId !== 'string') {
    return null;
  }

  return <AnswerForm quizId={parseInt(id)} questionId={parseInt(questionId)} />;
} 