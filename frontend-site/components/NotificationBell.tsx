'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { apiService } from '@/lib/api-service';

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
}

interface NotificationBellProps {
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const notificationsData = await apiService.getNotifications();
        setNotifications(notificationsData);
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
        // Utiliser des notifications fictives pour les tests
        setNotifications(mockNotifications);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotifications();
    
    // Simuler une mise à jour des notifications toutes les 30 secondes
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const unreadCount = notifications.filter(notification => !notification.isRead).length;
  
  const handleToggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };
  
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true } 
          : notification
      ));
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
      // Pour les tests, on met à jour l'état local même en cas d'erreur
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true } 
          : notification
      ));
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
      // Pour les tests, on met à jour l'état local même en cas d'erreur
      setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
    }
  };
  
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return (
          <div className="bg-green-500 rounded-full p-2 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="bg-yellow-500 rounded-full p-2 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="bg-red-500 rounded-full p-2 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'info':
      default:
        return (
          <div className="bg-blue-500 rounded-full p-2 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };
  
  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={handleToggleDropdown}
        className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>
      
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-[#0D111E] border border-white/10 rounded-xl shadow-lg overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-white font-medium">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-indigo-400 hover:text-indigo-300 text-sm"
                >
                  Tout marquer comme lu
                </button>
              )}
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-indigo-500 border-r-2 border-indigo-500 mb-2"></div>
                  <p className="text-gray-400 text-sm">Chargement des notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p className="text-white font-medium mb-1">Aucune notification</p>
                  <p className="text-gray-400 text-sm">Vous n'avez pas de notifications pour le moment.</p>
                </div>
              ) : (
                <div>
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`border-b border-white/5 p-4 hover:bg-white/5 transition-colors ${
                        !notification.isRead ? 'bg-white/5' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        {getNotificationIcon(notification.type)}
                        
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <h4 className="text-white font-medium text-sm">{notification.title}</h4>
                            <span className="text-gray-500 text-xs">
                              {new Date(notification.createdAt).toLocaleDateString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mt-1">{notification.message}</p>
                          
                          <div className="flex justify-between items-center mt-2">
                            {notification.link ? (
                              <Link href={notification.link}>
                                <span className="text-indigo-400 hover:text-indigo-300 text-xs">
                                  Voir les détails
                                </span>
                              </Link>
                            ) : (
                              <span></span>
                            )}
                            
                            {!notification.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="text-gray-400 hover:text-gray-300 text-xs"
                              >
                                Marquer comme lu
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="px-4 py-3 border-t border-white/10">
              <Link href="/notifications">
                <span className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center justify-center">
                  Voir toutes les notifications
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Notifications fictives pour les tests
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Nouvelle participation',
    message: 'John Doe a participé à votre quiz "Les capitales du monde"',
    createdAt: new Date().toISOString(),
    isRead: false,
    type: 'info',
    link: '/quiz/results/123'
  },
  {
    id: '2',
    title: 'Quiz terminé',
    message: 'Vous avez obtenu un score de 85% au quiz "Culture générale"',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Hier
    isRead: false,
    type: 'success',
    link: '/quiz/results/456'
  },
  {
    id: '3',
    title: 'Badge débloqué',
    message: 'Félicitations ! Vous avez débloqué le badge "Maître des quiz"',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 jours avant
    isRead: true,
    type: 'success',
    link: '/profile/badges'
  },
  {
    id: '4',
    title: 'Quiz en vedette',
    message: 'Votre quiz "Histoire de France" a été mis en vedette',
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 jours avant
    isRead: true,
    type: 'info'
  },
  {
    id: '5',
    title: 'Erreur de synchronisation',
    message: 'Une erreur est survenue lors de la synchronisation de vos données',
    createdAt: new Date(Date.now() - 345600000).toISOString(), // 4 jours avant
    isRead: true,
    type: 'error'
  }
];

export default NotificationBell; 