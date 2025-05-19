'use client';

import { useParams } from 'next/navigation';
import PresentationHost from '@/components/Quiz/PresentationHost';
import dynamic from 'next/dynamic';

// Import dynamique pour éviter les erreurs de rendu côté serveur avec QRCode
const PresentationHostWithNoSSR = dynamic(
  () => import('@/components/Quiz/PresentationHost'),
  { ssr: false }
);

export default function PresentationHostPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PresentationHostWithNoSSR sessionId={sessionId} />
    </div>
  );
}