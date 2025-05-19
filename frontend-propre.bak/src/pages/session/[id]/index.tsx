import { useRouter } from 'next/router';
import SessionDetail from '../../../components/session/SessionDetail';

export default function SessionDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  
  if (!id || typeof id !== 'string') {
    return null;
  }

  return <SessionDetail sessionId={parseInt(id)} />;
} 