const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ApiOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

async function fetchAPI(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', headers = {}, body } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json', // Important pour Laravel qui retourne des erreurs en JSON
    ...headers,
  };

  // Ajouter le token d'authentification s'il existe
  let token;
  try {
    token = localStorage.getItem('auth_token');
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
      console.log(`Token d'authentification trouvé pour ${endpoint}: ${token.substring(0, 10)}...`);
    } else {
      console.log(`Aucun token d'authentification trouvé pour ${endpoint}`);
    }
  } catch (error) {
    console.warn('Erreur lors de l\'accès à localStorage:', error);
  }

  const url = `${API_URL}/${endpoint}`;
  console.log(`Appel API: ${method} ${url}`);
  console.log('En-têtes:', JSON.stringify(requestHeaders));
  
  if (body) {
    console.log('Données envoyées:', JSON.stringify(body));
  }

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Log de la réponse brute pour le débogage
    console.log(`Réponse API statut ${endpoint}:`, response.status, response.statusText);
    
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      data = await response.json();
      console.log(`Réponse API données ${endpoint}:`, data);
    } else {
      const text = await response.text();
      console.log(`Réponse API texte ${endpoint}:`, text);
      try {
        // Tentative de parser le texte comme JSON
        data = JSON.parse(text);
      } catch (e) {
        data = { message: text || 'Réponse non-JSON reçue du serveur' };
      }
    }

    if (!response.ok) {
      // Construction d'une erreur plus détaillée
      const apiError: ApiError = {
        message: data.message || `Erreur ${response.status}: ${response.statusText}`,
      };
      
      // Si nous avons des erreurs de validation (422)
      if (response.status === 422 && data.errors) {
        apiError.errors = data.errors;
        
        // Créer un message d'erreur plus détaillé
        const errorMessages = Object.entries(data.errors as Record<string, string[]>)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        
        apiError.message = `Erreur de validation:\n${errorMessages}`;
      }
      
      console.error(`Erreur API ${endpoint}:`, apiError);
      throw apiError;
    }

    return data;
  } catch (error) {
    console.error(`Exception lors de l'appel API ${endpoint}:`, error);
    throw {
      message: error instanceof Error ? error.message : 'Erreur de connexion au serveur',
      originalError: error
    };
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

  // Fonction spécifique pour récupérer les thèmes depuis l'API
  getThemes: () => fetchAPI('themes'),
  
  // Fonction pour récupérer le thème actuel de l'utilisateur
  getUserTheme: () => fetchAPI('user/preferences/theme'),
  
  // Fonction pour sauvegarder le thème préféré de l'utilisateur
  saveUserTheme: (themeId: string) => fetchAPI('user/preferences/theme', {
    method: 'POST',
    body: { theme_id: themeId }
  }),
};
