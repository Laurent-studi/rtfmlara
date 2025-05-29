import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ApiOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// Fonction d'aide pour vérifier si le problème est lié à la connectivité
function isConnectivityError(error: unknown): boolean {
  if (error instanceof TypeError && (
    error.message.includes('Failed to fetch') ||
    error.message.includes('Network request failed') ||
    error.message.includes('NetworkError') ||
    error.message.includes('abort')
  )) {
    return true;
  }
  return false;
}

async function fetchAPI(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', headers = {}, body, timeout = 8000 } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...headers,
  };

  // Ajouter le token d'authentification s'il existe
  let token;
  try {
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('auth_token');
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.warn('Erreur lors de l\'accès à localStorage:', error);
  }

  const url = `${API_URL}/${endpoint}`;
  
  try {
    // Debug - afficher les détails de la requête
    console.log(`🚀 Requête API - ${method} ${url}`, { 
      headers: requestHeaders,
      body: body 
    });
    
    // Utiliser axios pour les requêtes
    const response = await axios({
      method: method,
      url: url,
      data: body,
      headers: requestHeaders,
      timeout: timeout
    });

    // Debug - afficher la réponse du serveur
    console.log(`✅ Réponse API - ${method} ${url}`, response.data);
    
    return response.data;
  } catch (error: any) {
    // Debug - afficher les détails de l'erreur
    console.error(`❌ Erreur API - ${method} ${url}`, error);
    
    // Gestion des erreurs Axios
    if (axios.isAxiosError(error)) {
      let errorMessage = 'Erreur de connexion au serveur';
      
      if (error.response) {
        // La requête a été effectuée et le serveur a répondu avec un code d'état qui n'est pas dans la plage 2xx
        const data = error.response.data;
        
        console.error('📝 Données d\'erreur du serveur:', data);
        
        errorMessage = data.message || `Erreur ${error.response.status}: ${error.response.statusText}`;
        
        const apiError: ApiError = {
          message: errorMessage,
        };
        
        if (error.response.status === 422 && data.errors) {
          apiError.errors = data.errors;
        }
        
        throw {
          ...apiError,
          status: error.response.status,
          originalError: error,
          serverData: data
        };
      } else if (error.request) {
        // La requête a été effectuée mais aucune réponse n'a été reçue
        errorMessage = 'Aucune réponse reçue du serveur';
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('api:offline', { detail: { endpoint } }));
        }
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
        errorMessage = error.message;
      }
      
      throw {
        message: errorMessage,
        originalError: error,
        isOffline: !error.response
      };
    }
    
    throw error;
  }
}

export const api = {
  get: (endpoint: string, options: ApiOptions = {}) => 
    fetchAPI(endpoint, { ...options, method: 'GET' }),
  
  post: (endpoint: string, data: any, options: ApiOptions = {}) => 
    fetchAPI(endpoint, { ...options, method: 'POST', body: data }),
  
  put: (endpoint: string, data: any, options: ApiOptions = {}) => 
    fetchAPI(endpoint, { ...options, method: 'PUT', body: data }),
  
  delete: (endpoint: string, options: ApiOptions = {}) => 
    fetchAPI(endpoint, { ...options, method: 'DELETE' }),

  // Fonctions pour les thèmes
  getThemes: () => fetchAPI('themes'),
  getUserTheme: () => fetchAPI('themes/current'),
  saveUserTheme: (themeId: number) => fetchAPI('themes/apply', {
    method: 'POST',
    body: { theme_id: themeId }
  }),
};
