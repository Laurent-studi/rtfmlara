'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Particles } from '@/components/magicui/particles';
import { ShineBorder } from '@/components/magicui/shine-border';
import { apiService } from '@/lib/api-service';
import { Notification } from '@/lib/api-service';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');
  
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const notificationsData = await apiService.getNotifications();
        setNotifications(notificationsData);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des notifications');
        // Utiliser des notifications fictives pour les tests
        setNotifications(mockNotifications);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotifications();
  }, []);
  
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true } 
          : notification
      ));
    } catch (err: any) {
      setError(err.message || 'Erreur lors du marquage de la notification');
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
    } catch (err: any) {
      setError(err.message || 'Erreur lors du marquage de toutes les notifications');
    }
  };
  
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await apiService.deleteNotification(notificationId);
      setNotifications(notifications.filter(notification => notification.id !== notificationId));
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression de la notification');
    }
  };
  
  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(notification => !notification.isRead);
      case 'read':
        return notifications.filter(notification => notification.isRead);
      case 'all':
      default:
        return notifications;
    }
  };
  
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return (
          <div className="bg-green-500 rounded-full p-3 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="bg-yellow-500 rounded-full p-3 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="bg-red-500 rounded-full p-3 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'info':
      default:
        return (
          <div className="bg-blue-500 rounded-full p-3 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };
  
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Hier à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-[#0D111E] relative overflow-hidden">
      <Particles className="absolute inset-0" />
      <Particles className="absolute inset-0" quantity={30} color="#4f46e5" size={0.8} />
      <Particles className="absolute inset-0" quantity={20} color="#7c3aed" size={1.2} />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <Link href="/dashboard">
              <div className="flex items-center gap-4">
                <Image
                  src="/img/logo6.png"
                  alt="RTFM2Win Logo"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <span className="text-white">Retour au tableau de bord</span>
              </div>
            </Link>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-white">Notifications</h1>
              
              {notifications.some(notification => !notification.isRead) && (
                <motion.button
                  onClick={handleMarkAllAsRead}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition-all"
                >
                  Tout marquer comme lu
                </motion.button>
              )}
            </div>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <div className="flex space-x-2 mb-6">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'all'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Toutes ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'unread'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Non lues ({notifications.filter(n => !n.isRead).length})
              </button>
              <button
                onClick={() => setActiveTab('read')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'read'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Lues ({notifications.filter(n => n.isRead).length})
              </button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="text-white text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500 border-r-2 border-indigo-500 mb-4"></div>
                  <p>Chargement des notifications...</p>
                </div>
              </div>
            ) : getFilteredNotifications().length === 0 ? (
              <div className="py-16 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <h2 className="text-white text-xl font-medium mb-2">Aucune notification</h2>
                <p className="text-gray-400">
                  {activeTab === 'all'
                    ? "Vous n'avez pas encore reçu de notifications."
                    : activeTab === 'unread'
                    ? "Vous n'avez pas de notifications non lues."
                    : "Vous n'avez pas de notifications lues."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {getFilteredNotifications().map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`bg-white/5 rounded-xl p-4 border ${
                      !notification.isRead ? 'border-indigo-500/30' : 'border-white/10'
                    }`}
                  >
                    <div className="flex gap-4">
                      {getNotificationIcon(notification.type)}
                      
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <h3 className="text-white font-medium">
                            {notification.title}
                            {!notification.isRead && (
                              <span className="ml-2 inline-block bg-indigo-500 h-2 w-2 rounded-full"></span>
                            )}
                          </h3>
                          <span className="text-gray-500 text-sm">
                            {formatDateTime(notification.createdAt)}
                          </span>
                        </div>
                        
                        <p className="text-gray-300 mt-1">{notification.message}</p>
                        
                        <div className="flex justify-between items-center mt-4">
                          <div className="flex gap-4">
                            {notification.link && (
                              <Link href={notification.link}>
                                <span className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center">
                                  Voir les détails
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                  </svg>
                                </span>
                              </Link>
                            )}
                            
                            {!notification.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="text-gray-400 hover:text-gray-300 text-sm"
                              >
                                Marquer comme lu
                              </button>
                            )}
                          </div>
                          
                          <button
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Paramètres de notifications</h2>
            <p className="text-gray-300 mb-4">Configurez vos préférences de notifications pour une expérience personnalisée.</p>
            
            <Link href="/profile/settings">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="py-2 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium shadow-lg hover:shadow-indigo-500/25 transition-all duration-200"
              >
                Gérer les paramètres de notifications
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

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
  },
  {
    id: '6',
    title: 'Maintenance prévue',
    message: 'Une maintenance est prévue le 15 mars de 2h à 4h. Le service pourrait être inaccessible pendant cette période.',
    createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 jours avant
    isRead: true,
    type: 'warning'
  }
]; 