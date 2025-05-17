'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import ToastNotification, { ToastProps, ToastType } from './ToastNotification';

interface ToastContextProps {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

export const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast doit être utilisé à l'intérieur d'un ToastProvider");
  }
  return context;
};

interface Toast extends ToastProps {
  id: string;
}

const ToastContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Créer l'élément de portail seulement côté client
    if (typeof document !== 'undefined') {
      let container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-3 items-end';
        document.body.appendChild(container);
      }
      setPortalContainer(container);
    }
    
    return () => {
      // Nettoyer le portail lorsque le composant est démonté
      if (typeof document !== 'undefined') {
        const container = document.getElementById('toast-container');
        if (container && container.childNodes.length === 0) {
          document.body.removeChild(container);
        }
      }
    };
  }, []);

  const showToast = (message: string, type: ToastType = 'info', duration: number = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type, duration };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const value = { showToast };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {portalContainer &&
        createPortal(
          <>
            {toasts.map((toast) => (
              <ToastNotification
                key={toast.id}
                id={toast.id}
                message={toast.message}
                type={toast.type}
                duration={toast.duration}
                onClose={() => removeToast(toast.id)}
              />
            ))}
          </>,
          portalContainer
        )}
    </ToastContext.Provider>
  );
};

export default ToastContainer; 