'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  isPolling: boolean;
  lastUpdate?: number;
  error?: string | null;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  isPolling,
  lastUpdate,
  error
}) => {
  const getStatusInfo = () => {
    if (error) {
      return {
        icon: AlertCircle,
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/50',
        message: 'Erreur de connexion'
      };
    }
    
    if (!isConnected) {
      return {
        icon: WifiOff,
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/20',
        borderColor: 'border-orange-500/50',
        message: 'Connexion perdue'
      };
    }
    
    if (isPolling) {
      return {
        icon: Wifi,
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500/50',
        message: 'Connecté'
      };
    }
    
    return {
      icon: CheckCircle,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/50',
      message: 'En attente'
    };
  };

  const statusInfo = getStatusInfo();
  const Icon = statusInfo.icon;
  
  const timeSinceUpdate = lastUpdate ? Date.now() - lastUpdate : 0;
  const showWarning = timeSinceUpdate > 10000; // Plus de 10 secondes

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`fixed top-4 right-4 z-50 ${statusInfo.bgColor} ${statusInfo.borderColor} border backdrop-blur-lg rounded-lg px-4 py-2 shadow-lg`}
      >
        <div className="flex items-center space-x-2">
          <motion.div
            animate={isPolling ? { rotate: 360 } : {}}
            transition={{ duration: 2, repeat: isPolling ? Infinity : 0, ease: "linear" }}
          >
            <Icon className={`w-4 h-4 ${statusInfo.color}`} />
          </motion.div>
          
          <span className={`text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.message}
          </span>
          
          {showWarning && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 bg-yellow-400 rounded-full"
            />
          )}
        </div>
        
        {lastUpdate && (
          <div className="text-xs text-gray-400 mt-1">
            Dernière mise à jour: {Math.floor(timeSinceUpdate / 1000)}s
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ConnectionStatus; 