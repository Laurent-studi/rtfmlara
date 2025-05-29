// Configuration de l'application
export const APP_CONFIG = {
  // Mode développement - désactive les appels API si le backend n'est pas disponible
  DEV_MODE: process.env.NODE_ENV === 'development',
  
  // URL de l'API
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  
  // Timeout pour les requêtes API (augmenté pour le développement)
  API_TIMEOUT: process.env.NODE_ENV === 'development' ? 10000 : 5000,
  
  // Désactiver les appels API en mode développement si pas de backend
  DISABLE_API_CALLS: process.env.NEXT_PUBLIC_DISABLE_API === 'true' || process.env.NODE_ENV === 'development',
};

// Fonction pour vérifier si l'API est disponible
export async function checkApiHealth(): Promise<boolean> {
  if (APP_CONFIG.DISABLE_API_CALLS) return false;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.API_TIMEOUT);
    
    const response = await fetch(`${APP_CONFIG.API_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
} 