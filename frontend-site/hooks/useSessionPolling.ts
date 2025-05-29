import { useCallback, useEffect, useRef } from 'react';

interface UseSessionPollingOptions {
  sessionId: string;
  onUpdate: (data: any) => void;
  onError: (error: string) => void;
  interval?: number;
  enabled?: boolean;
  conditions?: string[]; // États dans lesquels le polling doit être actif
  maxRetries?: number; // Nombre maximum de tentatives en cas d'erreur
}

export function useSessionPolling({
  sessionId,
  onUpdate,
  onError,
  interval = 3000, // Augmenté à 3 secondes par défaut
  enabled = true,
  conditions = ['waiting', 'question'],
  maxRetries = 3
}: UseSessionPollingOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);
  const retryCountRef = useRef(0);
  const lastSuccessRef = useRef<number>(Date.now());

  const fetchSessionState = useCallback(async () => {
    if (!enabled || isPollingRef.current) {
      console.log('🔄 Polling ignoré - désactivé ou déjà en cours');
      return;
    }
    
    isPollingRef.current = true;
    
    try {
      console.log(`🚀 Polling session ${sessionId} - Tentative ${retryCountRef.current + 1}`);
      
      const { api } = await import('@/lib/api');
      const response = await api.get(`presentation/sessions/${sessionId}`);
      
      if (response.success && response.data) {
        onUpdate(response.data);
        retryCountRef.current = 0; // Reset retry count on success
        lastSuccessRef.current = Date.now();
        console.log('✅ Polling réussi');
      } else {
        throw new Error(response.message || 'Erreur lors du chargement de la session');
      }
    } catch (err: any) {
      retryCountRef.current++;
      console.error(`❌ Erreur polling (tentative ${retryCountRef.current}/${maxRetries}):`, err.message);
      
      if (retryCountRef.current >= maxRetries) {
        console.error('🚫 Nombre maximum de tentatives atteint, arrêt du polling');
        onError(err.message || 'Erreur lors du chargement de la session');
        stopPolling();
      } else {
        // Augmenter l'intervalle en cas d'erreur (backoff exponentiel)
        const backoffDelay = interval * Math.pow(2, retryCountRef.current - 1);
        console.log(`⏳ Nouvelle tentative dans ${backoffDelay}ms`);
        setTimeout(() => {
          if (enabled) fetchSessionState();
        }, backoffDelay);
      }
    } finally {
      isPollingRef.current = false;
    }
  }, [sessionId, onUpdate, onError, enabled, interval, maxRetries]);

  const startPolling = useCallback((currentState?: string) => {
    if (!enabled) {
      console.log('🚫 Polling désactivé');
      return;
    }
    
    // Vérifier si le polling doit être actif selon les conditions
    if (currentState && !conditions.includes(currentState)) {
      console.log(`🚫 Polling non nécessaire pour l'état: ${currentState}`);
      return;
    }
    
    // Arrêter le polling existant
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    console.log(`🎯 Démarrage du polling (intervalle: ${interval}ms, conditions: ${conditions.join(', ')})`);
    
    // Démarrer le nouveau polling
    intervalRef.current = setInterval(() => {
      // Vérifier si le polling doit continuer selon les conditions
      if (currentState && !conditions.includes(currentState)) {
        console.log(`⏸️ Polling suspendu pour l'état: ${currentState}`);
        return;
      }
      
      // Vérifier si on n'a pas eu de succès depuis trop longtemps
      const timeSinceLastSuccess = Date.now() - lastSuccessRef.current;
      if (timeSinceLastSuccess > interval * 10) { // 10 fois l'intervalle
        console.warn('⚠️ Aucun succès depuis longtemps, arrêt du polling');
        stopPolling();
        onError('Connexion perdue avec le serveur');
        return;
      }
      
      fetchSessionState();
    }, interval);
  }, [fetchSessionState, interval, enabled, conditions]);

  const stopPolling = useCallback(() => {
    console.log('🛑 Arrêt du polling');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    retryCountRef.current = 0;
  }, []);

  // Effet de nettoyage
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    fetchSessionState,
    startPolling,
    stopPolling,
    isPolling: !!intervalRef.current
  };
}