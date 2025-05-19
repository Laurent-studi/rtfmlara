import Link from 'next/link';

interface AuthRequiredMessageProps {
  message?: string;
}

export default function AuthRequiredMessage({ message = 'Vous devez être connecté pour accéder à cette fonctionnalité' }: AuthRequiredMessageProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
      <svg 
        className="w-16 h-16 text-indigo-500 mx-auto mb-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-10v2m0 0v2m0-2h2M9 7h2.5" 
        />
      </svg>
      <h3 className="text-xl font-bold text-white mb-2">Authentification requise</h3>
      <p className="text-gray-400 mb-6">{message}</p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link href="/auth/login" className="btn-primary">
          Se connecter
        </Link>
        <Link href="/auth/register" className="btn-secondary">
          Créer un compte
        </Link>
      </div>
    </div>
  );
} 