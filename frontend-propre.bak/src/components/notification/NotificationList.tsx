'use client';

import { useState, useEffect } from 'react';
import { apiService, Notification } from '../../../lib/api';

export default function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await apiService.getNotifications();
        setNotifications(data);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setNotifications(
        notifications.map(notification => 
          notification.id === notificationId ? { ...notification, isRead: true } : notification
        )
      );
    } catch (err: any) {
      setError(err.message || 'Erreur lors du marquage de la notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      // Simuler le marquage de toutes les notifications comme lues
      // await apiService.markAllNotificationsAsRead();
      setNotifications(
        notifications.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (err: any) {
      setError(err.message || 'Erreur lors du marquage des notifications');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Notifications</h2>
        {notifications.some(notification => !notification.isRead) && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 m-4 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="p-6 text-center text-gray-400">
          <p>Aucune notification pour le moment</p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`p-4 border-b border-gray-700 hover:bg-gray-700/50 transition-colors ${
                !notification.isRead ? 'bg-gray-700/30' : ''
              }`}
            >
              <div className="flex items-start">
                <div className={`w-2 h-2 mt-2 rounded-full mr-3 ${
                  !notification.isRead ? 'bg-indigo-500' : 'bg-gray-600'
                }`}></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-medium ${!notification.isRead ? 'text-white' : 'text-gray-300'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{notification.message}</p>
                  <div className="flex justify-between items-center">
                    {notification.link && (
                      <a href={notification.link} className="text-xs text-indigo-400 hover:text-indigo-300">
                        Voir plus
                      </a>
                    )}
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs text-gray-500 hover:text-gray-400"
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
  );
} 